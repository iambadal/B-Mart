import express from 'express';
import { loginUser, registerUser, refresh, logout, forgot, reset } from '../controllers/authController.js';

const router = express.Router();

// Register user.
router.post("/register", registerUser);

// Login user.
router.post("/login", loginUser);

// Refresh token.
router.get("/refresh", refresh);

// Forgot password.
router.post("/forgot-pwd", forgot);

// Reset password.
router.post("/reset-pwd", reset);

// Logout user.
router.post("/logout", logout);

export default router