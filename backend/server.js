import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from 'node-cron';
import mongoose from "mongoose"; // Added missing import
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notfound, errorHandler } from './middlewares/errorMiddleware.js';
import releaseExpiredOrders from "./helpers/releaseExpiredOrders.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Cron job - every minute
cron.schedule("* * * * *", async () => {
    console.log("Backend is Running...");
    try {
        await releaseExpiredOrders();
    } catch (err) {
        console.error("Cron job error:", err);
    }
});

app.use(notfound);
app.use(errorHandler);


const startServer = async () => {
    let retries = 5;
    while (retries) {
        try {
            await connectDB(process.env.MONGO_URI);
            app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });
            break;
        } catch (error) {
            console.error(`MongoDB connection failed. Retries left: ${retries - 1}`);
            retries -= 1;
            await new Promise((res) => setTimeout(res, 5000));
        }
    }
    if (!retries) {
        console.error("❌ Could not connect to MongoDB after several attempts. Exiting...");
        process.exit(1);
    }
};

startServer();

process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed. App terminated.");
    process.exit(0);
});