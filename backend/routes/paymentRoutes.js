import express from "express";
import { authCheck } from "../middlewares/authMiddleware.js";
import { createRazorpayOrderForReserved, verifyPaymentAndCapture } from "../controllers/paymentController.js";


const router = express.Router();

// Create Razorpay order.
router.post("/order", authCheck, createRazorpayOrderForReserved);

// Verify payment [after success].
router.post("/verify", authCheck, verifyPaymentAndCapture);

// Razorpay Webhook (server-to-server).


export default router;