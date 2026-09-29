import express from "express";
import { createProduct, getProducts, updateProduct, deleteProduct, deleteProductMany, updateProductStatus, getProductsById } from "../controllers/productController.js";
import { authCheck, isAdmin } from "../middlewares/authMiddleware.js";
import multer from "multer";

// Multer setup for temp memory storage
const upload = multer({ dest: "temp/uploads" });

const router = express.Router();

// Get all products + search & filters
router.get("/", getProducts);

// Get product by ID
router.get("/:id", getProductsById);

// Product reviews

// Admin routes
router.post("/", authCheck, isAdmin, upload.array("images", 5), createProduct);
router.patch("/:id", authCheck, isAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", authCheck, isAdmin, deleteProduct);
router.put("/bulk/delete", authCheck, isAdmin, upload.none(), deleteProductMany);
router.put("/bulk/status", authCheck, isAdmin, upload.none(), updateProductStatus);

export default router;