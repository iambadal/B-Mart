import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import razorpayInstance from "../config/razorpay.js";

// POST /api/orders  [create order and reserve stock after successful payment]
export const createOrderAndReserve = async (req, res) => {
    try {

        const { items, shippingAddress, totals, COD } = req.body;

        if (!items.length) return res.status(400).json({ message: "No order items" });

        // Check and reserve stock.
        for (const item of items) {

            const product = await Product.findById(item.product).select("stock");

            if (!product) return res.status(400).json({ message: "Invalid product in cart." });

            if (product.stock < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
            }
        }

        // Decrement stock [reserve]
        await Promise.all(items.map(({ product, qty }) => Product.updateOne({ _id: product }, { $inc: { stock: -qty } })));

        // // Reserve time: 15 minutes from now
        const reservedUntil = new Date(Date.now() + 15 * 60 * 1000);

        // Create order
        const order = await Order.create({
            user: req.user?._id,
            items,
            shippingAddress,
            totals,
            paymentInfo: COD ? {
                provider: "COD",
                status: "pending",
            } : {
                provider: "",
                status: ""
            },
            status: COD ? "processing" : "pending",
            reservedUntil,
        });

        res.status(201).json(order);

    } catch (error) {
        console.error("Create order and reserve error:", error);
        res.status(500).json({ success: false, message: "Failed to create order." });
    }
};

// GET /api/orders/mine/:id
export const getCustomerOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
        if (!order) return res.status(404).json({ message: "Order not found." });
        return res.json(order);
    } catch (error) {
        console.error("Get customer order error:", error);
        return res.status(500).json({ message: "Could not fetch this order." });
    }
};

// POST /api/orders/mine/:id/cancel
export const cancelCustomerOrder = async (req, res) => {
    try {
        const existing = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!existing) return res.status(404).json({ message: "Order not found." });

        if (["shipped", "delivered", "cancelled", "refunded"].includes(existing.status)) {
            return res.status(409).json({ message: "This order can no longer be cancelled." });
        }
        if (existing.cancellationStatus === "processing" || existing.cancellationStatus === "completed") {
            return res.status(409).json({ message: "Cancellation is already being processed." });
        }

        const wasPaid = existing.paymentInfo?.status === "captured";
        if (wasPaid) {
            if (!existing.paymentInfo?.paymentId) {
                return res.status(409).json({ message: "The payment reference is unavailable; contact support to cancel this order." });
            }

            const claimedOrder = await Order.findOneAndUpdate(
                {
                    _id: existing._id,
                    user: req.user._id,
                    status: { $in: ["paid", "processing"] },
                    "paymentInfo.status": "captured",
                    cancellationStatus: { $in: [null, "failed"] },
                },
                { $set: { cancellationStatus: "processing" } },
                { new: true }
            );
            if (!claimedOrder) return res.status(409).json({ message: "This order can no longer be cancelled." });

            let refund;
            try {
                refund = await razorpayInstance.payments.refund(claimedOrder.paymentInfo.paymentId, {
                    notes: { orderId: claimedOrder._id.toString(), reason: "Customer cancellation" },
                });
            } catch (refundError) {
                console.error("Razorpay refund error:", refundError);
                if (refundError.statusCode) {
                    await Order.updateOne(
                        { _id: claimedOrder._id, cancellationStatus: "processing" },
                        { $set: { cancellationStatus: "failed" } }
                    );
                    return res.status(502).json({ message: refundError.error?.description || "Razorpay could not create the refund. Please try again or contact support." });
                }
                return res.status(503).json({ message: "Refund status could not be confirmed. Cancellation is held for review; do not retry." });
            }

            const cancelledOrder = await Order.findOneAndUpdate(
                { _id: claimedOrder._id, cancellationStatus: "processing", status: { $in: ["paid", "processing"] } },
                { $set: {
                    status: "cancelled",
                    cancelledAt: new Date(),
                    reservedUntil: null,
                    cancellationStatus: "completed",
                    "paymentInfo.refundId": refund.id,
                    "paymentInfo.refundStatus": refund.status,
                    "paymentInfo.status": "refunded",
                } },
                { new: true }
            );
            if (!cancelledOrder) {
                return res.status(503).json({ message: "Razorpay accepted the refund, but the order update needs support review." });
            }
            await Promise.all(cancelledOrder.items.map(({ product, qty }) =>
                Product.updateOne({ _id: product }, { $inc: { stock: qty } })
            ));
            return res.json({ status: "success", message: "Order cancelled and a full refund was requested to the original payment method.", order: cancelledOrder });
        }

        if (!["pending", "processing"].includes(existing.status) || ["created", "captured"].includes(existing.paymentInfo?.status)) {
            return res.status(409).json({ message: "This order can no longer be cancelled." });
        }
        const order = await Order.findOneAndUpdate(
            { _id: existing._id, user: req.user._id, status: { $in: ["pending", "processing"] }, "paymentInfo.status": { $nin: ["captured", "created"] } },
            { $set: { status: "cancelled", cancelledAt: new Date(), reservedUntil: null, cancellationStatus: "completed" } },
            { new: true }
        );
        if (!order) return res.status(409).json({ message: "This order can no longer be cancelled." });

        await Promise.all(order.items.map(({ product, qty }) =>
            Product.updateOne({ _id: product }, { $inc: { stock: qty } })
        ));
        return res.json({ status: "success", message: "Order cancelled.", order });
    } catch (error) {
        console.error("Cancel customer order error:", error);
        return res.status(500).json({ message: "Could not cancel this order." });
    }
};

// GET /api/orders/recent
export const recentOrders = async (req, res) => {
    try {

        const orders = await Order.find().populate("user", "username email").sort({ createdAt: -1 }).limit(6);

        res.json(orders);

    } catch (error) {
        console.error("Get recent orders error:", error);
        res.status(500).json({ status: "failure", message: "Fetch recent orders error." });
    }
};

// GET /api/orders
export const allOrders = async (req, res) => {
    try {

        const query = req.query;
        let q = {};

        // Filter by search...
        if (query.keyword) {

            const keyword = query.keyword.trim();

            const orConditions = [
                { "shippingAddress.name": { $regex: keyword, $options: "i" } },
                { "paymentInfo.orderId": { $regex: keyword, $options: "i" } },
                { "paymentInfo.paymentId": { $regex: keyword, $options: "i" } },
            ];

            // If keyword is a valid ObjectId, add _id search.
            if (mongoose.Types.ObjectId.isValid(keyword)) {
                orConditions.push({ _id: new mongoose.Types.ObjectId(keyword) });
            }

            q.$or = orConditions;
        };

        // Filter by Status...
        if (query.status) q.status = query.status.toLowerCase();

        // Sort..
        let sort = "-createdAt";

        // Pagination
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Order.find(q).sort(sort).skip(skip).limit(limit).lean(),
            Order.countDocuments(q),
        ]);

        return res.json({
            items,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ status: "failure", message: "Fetch all orders error." });
    }
};

// POST /api/orders/update
export const updateOrders = async (req, res) => {
    try {

        const { ids, status, notes } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0 || !status) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }

            await Order.updateMany({ _id: { $in: ids } }, { $set: { status: status.toLowerCase(), notes: notes } });
            res.status(200).json({ status: "success", message: "Order status is updated." });


    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ status: "failure", message: "Update order error." });
    }
};

// PUT /api/orders/delete
export const deleteOrders = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0 ) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }

            await Order.deleteMany({ _id: { $in : ids } });
            res.status(200).json({ status:"success", message: " Orders are deleted." })

    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ status: "failure", message: "Update order error." });
    }
};
