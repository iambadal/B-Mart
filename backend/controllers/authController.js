import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { buildAuthResponse } from '../utils/buildAuthResponse.js';
import { signToken } from '../utils/signToken.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// POST /api/auth/register
export const registerUser = async (req, res) => {
    let accountCreated = false;
    try {
        const { username } = req.body;
        const email = req.body.email?.toLowerCase().trim();
        const password = req.body.password;

        if (!email || !username || !password) {
            return res.status(400).json({ type: false, message: "Username, Email, Password required" });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ type: false, message: "Email already in use" });

        const hash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await User.create({
            username,
            email,
            password: hash,
            isVerified: false,
            emailVerificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
            emailVerificationExpires: verificationExpires,
        });
        accountCreated = true;

        const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
        await sendEmail({
            to: email,
            subject: "Verify your B-Mart email",
            text: `Verify your email by opening: ${verificationLink}`,
            html: `<p>Hi ${username},</p><p>Please verify your email address to activate your B-Mart account.</p><p><a href="${verificationLink}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
        });

        res.status(201).json({ type: true, message: "Account created. Check your email for a verification link." });
    } catch (error) {
        console.error("Register error:", error);
        if (accountCreated) {
            return res.status(503).json({
                type: false,
                code: "EMAIL_DELIVERY_FAILED",
                message: "Your account was created, but the verification email could not be sent. Check the backend email settings, then request a new link from Verify email.",
            });
        }
        res.status(500).json({ type: false, message: "Registration failed" });
    }
};

// POST /api/auth/login
// POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        console.log("👉 Login attempt received with body:", req.body);

        // Force lowercase and remove spaces to match MongoDB exactly
        const email = req.body.email?.toLowerCase().trim();
        const password = req.body.password;

        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ type: false, message: "Email and password required" });
        }

        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            console.log("❌ Email not found in database:", email);
            return res.status(401).json({ type: false, message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ type: false, code: "EMAIL_NOT_VERIFIED", message: "Please verify your email before signing in. You can request a new verification link." });
        }

        if (user.status === "Banned") {
            return res.status(423).json({ type: false, message: "Your account is temporarily locked!" });
        }

        const validPass = await bcrypt.compare(password, user.password);
        
        if (!validPass) {
            console.log("❌ Password did not match for user:", email);
            return res.status(401).json({ type: false, message: "Invalid credentials" });
        }

        console.log("✅ Login successful for:", email);

        const authData = buildAuthResponse(user);
        const refreshToken = authData.tokens.refreshToken;

        user.refreshToken = refreshToken;
        await user.save();

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json(authData);

    } catch (error) {
        console.error("🔥 Server Error during login:", error);
        res.status(500).json({ type: false, message: "Login failed" });
    }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() },
        }).select("+emailVerificationToken +emailVerificationExpires");

        if (!user) return res.status(400).json({ status: "failure", message: "Verification link is invalid or expired. Request a new one." });

        user.isVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        return res.json({ status: "success", message: "Email verified. You can now sign in." });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ status: "failure", message: "Email verification failed." });
    }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        if (!email) return res.status(400).json({ status: "failure", message: "Email address is required." });
        const genericMessage = "If the account needs verification, a new link will be sent.";
        const user = await User.findOne({ email });
        if (!user || user.isVerified) return res.json({ status: "success", message: genericMessage });

        const token = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${token}`;
        await sendEmail({
            to: user.email,
            subject: "Verify your B-Mart email",
            text: `Verify your email by opening: ${verificationLink}`,
            html: `<p>Hi ${user.username},</p><p><a href="${verificationLink}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
        });
        return res.json({ status: "success", message: genericMessage });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(503).json({ status: "failure", message: "The email service could not send a verification link. Check the backend email settings." });
    }
};


// POST /api/auth/refresh
export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isVerified || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const accessToken = signToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, "15m");

        res.json({
            accessToken,
            user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        console.error("Refresh error:", error);
        res.status(401).json({ message: "Invalid refresh token" });
    }
};

// POST /api/auth/forgot-pwd
export const forgot = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        if (!email) return res.status(400).json({ message: "Email address is required." });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Invalid email!" });

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        user.reset_token = token;
        user.reset_token_expire = expires;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

        await sendEmail({
            to: email,
            subject: '🔐 Password Reset Request',
            text: 'Set a new password.',
            html: `
            <p>Hi there,</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you didn’t request this, please ignore this email.</p>
          `
        });

        res.status(200).json({ status: "success", message: "Password reset link sent." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(503).json({ message: "The email service could not send your password reset link. Check the backend email settings." });
    }
};

// POST /api/auth/reset-pwd
export const reset = async (req, res) => {
    try {
        const { password, cPassword, token } = req.body;

        if (password !== cPassword) return res.status(406).json({ message: "Password does not match." });

        const user = await User.findOne({ reset_token: token }).select("+password reset_token reset_token_expire");

        if (!user || user.reset_token_expire < Date.now()) return res.status(408).json({ message: "Token is invalid or expired" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.reset_token = null;
        user.reset_token_expire = null;

        await user.save();
        res.status(200).json({ status: "success", message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Password reset error." });
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.sendStatus(204);
        const user = await User.findOne({ refreshToken: token });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("User logout error:", error);
        res.status(500).json({ status: "failure", message: "User logout error." });
    }
};
