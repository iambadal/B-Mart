import Order from "../models/Order.js";
import razorpayInstance from "../config/razorpay.js";
import crypto from "node:crypto";

// POST /api/payments/order [auth]
export const createRazorpayOrderForReserved = async (req, res) => {
    try {
      
        const { orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status !== "pending") return res.status(400).json({ message: "Order already paid or cancelled" });

        if (order.paymentInfo?.status === "created" || order.paymentInfo?.status === "captured") {
            return res.status(409).json({ message: "Payment has already been started for this order." });
        }

        const amount = order.totals.totalPrice;

        const options = {
            amount: Math.round(amount * 100),  // convert rupees → paise
            currency: "INR",
            receipt: `rcpt_${order?._id}`,
            notes: { userId: req.user._id, orderId: order?._id.toString() },
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        order.paymentInfo = { provider: "razorpay", orderId: razorpayOrder.id, status: "created" };
        await order.save();

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ status: "failure", message: "Incomplete payment payload" });
        }

        // Find local order by razorpay_order_id.
        const order = await Order.findOne({ "paymentInfo.orderId": razorpay_order_id, user: req.user._id });

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status !== "pending" || order.paymentInfo.status !== "created") {
            return res.status(409).json({ status: "failure", message: "Order is no longer awaiting payment." });
        }

        // Verify signature.
        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

        const expected = Buffer.from(expectedSignature);
        const received = Buffer.from(razorpay_signature);
        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            return res.status(400).json({ status: "failure", message: "Invalid signature" });
        }
        const paidOrder = await Order.findOneAndUpdate(
            { _id: order._id, user: req.user._id, status: "pending", "paymentInfo.status": "created" },
            { $set: {
                "paymentInfo.provider": "razorpay",
                "paymentInfo.paymentId": razorpay_payment_id,
                "paymentInfo.signature": razorpay_signature,
                "paymentInfo.status": "captured",
                status: "paid",
                paidAt: new Date(),
            } },
            { new: true }
        );
        if (!paidOrder) return res.status(409).json({ status: "failure", message: "Order is no longer awaiting payment." });

        res.json({ status: "success", order: paidOrder });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Payment verification error." })
    }
};
