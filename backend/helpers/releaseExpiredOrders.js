import Order from "../models/Order.js";
import Product from "../models/Product.js";

const releaseExpiredOrders = async () => {
    try {
        const now = new Date();
        const candidates = await Order.find({ status: "pending", reservedUntil: { $lt: now } }).select("_id");

        for (const candidate of candidates) {
            // Atomically claim each reservation so cancellation and this job cannot both return stock.
            const order = await Order.findOneAndUpdate(
                { _id: candidate._id, status: "pending", reservedUntil: { $lt: now } },
                { $set: { status: "cancelled", cancelledAt: now, reservedUntil: null } },
                { new: true }
            );
            if (!order) continue;
            // Return stock back.
            for (const item of order.items) {
                if (!item.product || !item.qty) continue;
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: Number(item.qty) },
                });
            }

        }

        if (candidates.length > 0) {
            console.log(`Processed ${candidates.length} expired order reservations.`);
        }
    } catch (err) {
        console.error("Release expired orders error:", err);
    }
};

export default releaseExpiredOrders;
