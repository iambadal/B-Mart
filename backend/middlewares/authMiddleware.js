import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Routes
export const authCheck = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (excluding password).
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next();

        } catch (error) {
            console.error("Auth error:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Admin check
export const isAdmin = (req, res, next) => {
if (req.user && req.user.role === "admin") {
    req.user.role;
    next();
} else {
    return res.status(403).json({ message: "Not authorized as admin" });
}
}