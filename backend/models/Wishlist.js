import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // one wishlist per user
    },
    products : [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            addedAt: { type: Date, default: Date.now},
            priceAtAdd: Number, // optional snapshot...
        }
    ]
});

export default mongoose.model("Wishlist", wishlistSchema);