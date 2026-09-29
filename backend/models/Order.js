import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },

}, { _id: true });

const shippingSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String },
    email: { type: String },
});

const paymentInfoSchema = new mongoose.Schema({
    provider: { type: String, default: "razorpay" },
    orderId: { type: String },    // razorpay order_id
    paymentId: { type: String },  // razorpay payment_id
    signature: { type: String },  // razorpay signature.
    status: { type: String },     //  'created', 'captured', 'failed'
    raw: { type: mongoose.Schema.Types.Mixed }, // store raw response.
});

const totalsSchema = new mongoose.Schema({
    itemsPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: shippingSchema,
    paymentInfo: paymentInfoSchema,
    totals: totalsSchema,
    status: {
        type: String,
        enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
        default: "pending",
    },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String },
    reservedUntil: { type: Date },

}, { timestamps: true });

// Index orderId in paymentInfo for quick lookup via razorpay order id.
orderSchema.index({ "paymentInfo.orderId": 1 });
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);