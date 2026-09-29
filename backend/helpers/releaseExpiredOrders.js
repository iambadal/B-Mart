import Order from "../models/Order.js";
import Product from "../models/Product.js";

const releaseExpiredOrders = async () => {
    try {
        const now = new Date();
        const expiredOrders = await Order.find({
            status: "pending",
            reservedUntil: { $lt: now },
        });

        for (const order of expiredOrders) {
            // Return stock back.
            for (const item of order.items) {
                if (!item.product || !item.qty) continue;

                const product = await Product.findById(item.product);
                if (!product) continue;

                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: Number(item.qty) },
                });
            }

            // Cancel order and change status.
            order.status = "cancelled";
            await order.save();
        }

        if (expiredOrders.length > 0) {
            console.log(`Released ${expiredOrders.length} expired orders.`);
        }
    } catch (err) {
        console.error("Release expired orders error:", err);
    }
};

export default releaseExpiredOrders;