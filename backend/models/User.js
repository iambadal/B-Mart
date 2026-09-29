import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    country: { type: String },
    phone: { type: String },
    email: { type: String },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["Banned", "Unbanned"],
        default: "Unbanned",
    },
    avatar: {
        url: { type: String, default: null },
        public_id: { type: String, default: null },
    },
    refreshToken: {
        type: String,
        default: null,
    },
    reset_token: { type: String, default: null },
    reset_token_expire: { type: Date, default: null },

    phone: { type: String, default: null },
    address: addressSchema,
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, { timestamps: true });

userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model("User", userSchema);
