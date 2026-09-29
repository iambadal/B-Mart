import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

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
