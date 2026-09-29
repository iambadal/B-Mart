import express from "express";
import { authCheck, isAdmin } from "../middlewares/authMiddleware.js";
import { allOrders, createOrderAndReserve, recentOrders, updateOrders, deleteOrders, getCustomerOrder, cancelCustomerOrder } from "../controllers/orderController.js";

const router = express.Router();

// Create new order.
router.post("/", authCheck, createOrderAndReserve);
router.get("/mine/:id", authCheck, getCustomerOrder);
router.post("/mine/:id/cancel", authCheck, cancelCustomerOrder);

// Get recent orders.
router.get("/recent", authCheck, isAdmin, recentOrders);

// Get logged-in user's orders.
router.get("/", authCheck, isAdmin, allOrders);

// Get order by ID.

// Update order status [Admin only].
router.post("/update", authCheck, isAdmin, updateOrders);

// Delete orders [Admin only]
router.post("/delete", authCheck, isAdmin, deleteOrders);

export default router;
