import Order from "../models/Order.js";
import razorpayInstance from "../config/razorpay.js";
import crypto from "node:crypto";

// POST /api/payments/order [auth]
export const createRazorpayOrderForReserved = async (req, res) => {
    try {
      
        const { amount, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status !== "pending") return res.status(400).json({ message: "Order already paid or cancelled" });

        const options = {
            amount: Math.round(amount * 100),  // convert rupees → paise
            currency: "INR",
            receipt: `rcpt_${order?._id}`,
            notes: { userId: req.user._id, orderId: order?._id.toString() },
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            status: razorpayOrder.status,
        });

    } catch (error) {
        console.error("Razorpay crete order error:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
};

// POST /api/payment/verify [auth]
// After Razorpay success.
export const verifyPaymentAndCapture = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, meta } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ status: "failure", message: "Incomplete payment payload" });
        }

        // Find local order by razorpay_order_id.
        const order = await Order.findOne({ "paymentInfo.orderId": razorpay_order_id }) ||
            await Order.findOne({ status: "pending" }); // fallback...

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Verify signature.
        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ status: "failure", message: "Invalid signature" });
        }
        // Mark order as paid
        order.paymentInfo = {
            provider: "razorpay",
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: "captured",
        };
        order.status = "paid";
        order.paidAt = new Date();

        await order.save();

        res.json({ status: "success", order });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Payment verification error." })
    }
};