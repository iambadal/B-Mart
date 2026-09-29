import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"], trim: true },
    subtitle: { type: String, required: [true, "SubTitle is required"], trim: true },
    category: { type: String, required: true, trim: true },
    banner: {
        url: { type: String, default: null, },
        public_id: { type: String, default: null, },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);