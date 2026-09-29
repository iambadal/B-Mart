import express from "express";
import { authCheck, isAdmin } from "../middlewares/authMiddleware.js";
import { deleteUser, getAddress, getUser, updateAddress, updateUser, getUserReviews, deleteUserProductReview, addUserProductReview, getUserOrders, addToUserWishlist, getWishlist, removeFromWishlist, fetchBanners } from "../controllers/userController.js";
import multer from "multer";

// Multer setup for temp memory storage
const upload = multer({ dest: "temp/uploads" });

const router = express.Router();

// User data fetch.
router.get("/", authCheck, getUser);

// User data update.
router.post("/", authCheck, upload.single("avatar"), updateUser);

// User data delete
router.delete("/", authCheck, deleteUser);

// Address fetch.
router.get("/address", authCheck, getAddress);

// Address update.
router.post("/address", authCheck, upload.none(), updateAddress);

// User reviews fetch.
router.get("/reviews", authCheck, getUserReviews);

// User reviews update/create.
router.post("/reviews/:id", authCheck, upload.none(), addUserProductReview);

// User review delete
router.delete("/reviews/:id", authCheck, deleteUserProductReview);

// User orders fetch
router.get("/orders", authCheck, getUserOrders);

// User wishlist fetch
router.get("/wishlist", authCheck, getWishlist);
// User wishlist create
router.post("/wishlist", authCheck, upload.none(), addToUserWishlist);
// User wishlist delete
router.delete("/wishlist/:productId", authCheck, removeFromWishlist);

// Banners fetch
router.get("/banners", fetchBanners);

export default router;