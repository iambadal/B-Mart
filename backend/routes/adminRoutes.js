import express from "express";
import { categoryDistribution, createBanner, deleteBanners, getAllBanners, salesPerMonth, stockStatus, summary, updateBanner, userRoleUpdate, usersDelete, usersList, userStatusUpdate } from "../controllers/adminController.js";
import { authCheck, isAdmin } from "../middlewares/authMiddleware.js";
import multer from "multer";

// Multer setup for temp memory storage
const upload = multer({ dest: "temp/uploads" });

const router = express.Router();

// Dashboard summary.
router.get("/summary", authCheck, isAdmin, summary);

// Sales per month.
router.get("/sales", authCheck, isAdmin, salesPerMonth);

// Category distribution.
router.get("/category-distribution", authCheck, isAdmin, categoryDistribution);

// Stock status.
router.get("/stock-status", authCheck, isAdmin, stockStatus);

// Users data list.
router.get("/users", authCheck, isAdmin, usersList);

// User status update.
router.post("/users/status-update", authCheck, isAdmin, userStatusUpdate);

// User role updates.
router.post("/users/role-update", authCheck, isAdmin, userRoleUpdate);

// User delete.
router.put("/users", authCheck, isAdmin, usersDelete);

// Banners fetch
router.get("/banner", authCheck, isAdmin, getAllBanners);
// Banner create
router.post("/banner", authCheck, isAdmin,  upload.single("banner"), createBanner);
// Banner update
router.put("/banner/:id", authCheck, isAdmin, upload.single("banner"), updateBanner);
// Banners delete
router.put("/banner", authCheck, isAdmin, deleteBanners);



export default router