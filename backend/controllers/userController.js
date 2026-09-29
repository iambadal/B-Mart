import Banner from "../models/Banner.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Wishlist from "../models/Wishlist.js";
import cloudinaryDestroy from "../utils/cloudinaryDestroy.js";
import cloudinaryUpload from "../utils/cloudinaryUploader.js";
import userDelete from "../utils/userDeletes.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "node:crypto";


// GET /api/user
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        if (!user) return res.status(401).json({ success: "failure", message: "Invalid user." })

        const userData = {
            address: user.address,
            avatar: user.avatar,
            username: user.username,
            email: user.email,
            phone: user.phone,
            status: user.status,
        }
        res.status(200).json({ status: "success", user: { ...userData } });

    } catch (error) {
        console.error("Get user data error:", error);
        res.status(500).json({ status: "failure", message: "Get user fetch error." });
    }
};

// POST /api/user
export const updateUser = async (req, res) => {
    try {

        const { username, email, phone, public_id } = req.body;

        const user = await User.findById(req.user._id).select("-password, -refreshToken");

        if (!user) return res.status(401).json({ status: "failure", message: "Invalid user!" });

        // Image uploading.
        if (req.file) {
            if (public_id) await cloudinaryDestroy([{ public_id: public_id }]);
            const result = await cloudinaryUpload([req.file], "E_commerce/profile-image");
            user.avatar = result[0];
        };

        // Update other fields.
        if (user.username !== username && username) user.username = username;
        const normalizedEmail = email?.toLowerCase().trim();
        if (user.email !== normalizedEmail && normalizedEmail) {
            const emailInUse = await User.exists({ email: normalizedEmail, _id: { $ne: user._id } });
            if (emailInUse) return res.status(409).json({ status: "failure", message: "Email already in use." });
            const verificationToken = crypto.randomBytes(32).toString("hex");
            user.email = normalizedEmail;
            user.isVerified = false;
            user.refreshToken = null;
            user.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();
            const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
            await sendEmail({
                to: normalizedEmail,
                subject: "Verify your new B-Mart email",
                text: `Verify your new email by opening: ${verificationLink}`,
                html: `<p><a href="${verificationLink}">Verify your new email</a></p><p>This link expires in 24 hours.</p>`,
            });
            res.clearCookie("refreshToken");
            return res.status(200).json({ status: "success", message: "Profile updated. Verify your new email before your next sign in.", user });
        }
        if (user.phone !== phone && phone) user.phone = phone;

        const newData = await user.save();
        res.status(200).json({ status: "success", user: newData })

    } catch (error) {
        console.error("Update user data error:", error);
        res.status(500).json({ status: "failure", message: "User data update error." });
    }
};

// DELETE /api/user
export const deleteUser = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) return res.status(401).json({ status: "failure", message: "Invalid request!" });

        // Delete user [soft delete - Auto delete after 30 days]
        await userDelete(req.user._id);

        res.clearCookie("refreshToken");

        res.status(200).json({ status: "success", message: "User deleted successfully (soft delete)" })

    } catch (error) {
        console.error("User delete error:", error);
        res.status(500).json({ status: "failure", message: "User delete error." });
    }
};

// GET /api/user/address
export const getAddress = async (req, res) => {
    try {

        const address = await User.findById(req.user._id).select("address").lean();
        res.status(200).json({ status: "success", ...address?.address });

    } catch (error) {
        console.error("Get address error:", error);
        res.status(500).json({ status: "failure", message: "Fetching address error." })
    }
};

// POST /api/user/address
export const updateAddress = async (req, res) => {
    try {

        const address = await User.findById(req.user._id).select("address");

        if (!address || !req.body) return res.status(401).json({ status: "failure", message: "Invalid data!" });

        address.address = { ...req.body };
        const result = await address.save();
        res.status(200).json({ status: "success", result });

    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({ status: "failure", message: "Address update error." })
    }
};

// GET /api/user/reviews
export const getUserReviews = async (req, res) => {
    try {

        // pagination
        const sort = "-createdAt";
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        // total products reviewed by user
        const total = await Product.countDocuments({ "reviews.user": req.user._id });

        // fetch paginated
        const products = await Product.find({ "reviews.user": req.user._id })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Filtered reviews
        const filteredProducts = products.map(p => ({
            product: {
                _id: p._id,
                name: p.name,
                image: p.images[0]?.url
            },
            reviews: p.reviews?.filter(r => r.user?.toString() === req.user?._id?.toString())?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }));

        return res.json({
            items: filteredProducts,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });


    } catch (error) {
        console.error("Get user reviews error:", error);
        res.status(500).json({ status: "failure", message: "Fetch user reviews error." })
    }
};

// POST /api/user/reviews/:id
export const addUserProductReview = async (req, res) => {

    try {

        const { rating, comment, title } = req.body;
        const product = await Product.findById(req.params.id);

        const numericRating = Number(rating);
        if (!Number.isFinite(numericRating) || numericRating < 0.5 || numericRating > 5 || !comment?.trim() || !title?.trim()) {
            return res.status(400).json({ status: "failure", message: "Provide a rating from 0.5 to 5, a title, and a review." });
        }

        if (!product) return res.status(404).json({ status: "failure", message: "Product not found" });

        const deliveredPurchase = await Order.exists({
            user: req.user._id,
            status: "delivered",
            "items.product": product._id,
        });
        if (!deliveredPurchase) return res.status(403).json({ status: "failure", message: "You can review this product after an order containing it is delivered." });


        // check if user already reviewed.
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())

        // Reviews
        if (alreadyReviewed) {
            // Update existing review
            alreadyReviewed.rating = numericRating;
            alreadyReviewed.comment = comment.trim();
            alreadyReviewed.title = title.trim();
        } else {
            // Add new review
            const review = {
                user: req.user._id,
                name: req.user.username,
                rating: numericRating,
                comment: comment.trim(),
                title: title.trim(),
            };
            product.reviews.push(review);
        };

        // update counts
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

        await product.save();

        res.status(201).json({
            status: "success",
            message: "Review added/updated successfully",
            product,
        });

    } catch (error) {
        console.error("Add product review error:", error);
        res.status(500).json({ status: "failure", message: "Add/update product review error." });
    }
};

// DELETE /api/user/reviews/:id
export const deleteUserProductReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ status: "failure", message: "Product not found" });

        // Filter product reviews
        const newReviews = product.reviews.filter(r => r.user.toString() !== req.user?._id.toString());

        // Update reviews
        product.reviews = newReviews;

        // update counts
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.length > 0 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0;

        await product.save();

        res.status(200).json({ status: "success", message: "Product review is deleted." })

    } catch (error) {
        console.error("Delete product review error:", error);
        res.status(500).json({ status: "failure", message: "Delete product review error." });
    }
};

// GET /api/user/orders
export const getUserOrders = async (req, res) => {
    try {

        // pagination
        const sort = "-createdAt";
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        // total orders.
        const total = await Order.countDocuments({ "user": req.user._id });

        // fetch paginated
        const orders = await Order.find({ "user": req.user._id })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Filtered orders
        const newOrders = orders.map(order => ({
            order_id: order._id,
            product_id: order.items[0]?.product,
            image: order.items[0]?.image,
            name: order.items[0]?.name,
            qty: order.items[0]?.qty,
            totalPrice: order.totals?.totalPrice,
            status: order.status,
            canCancel: (
                ["pending", "processing"].includes(order.status) && !["created", "captured"].includes(order.paymentInfo?.status)
            ) || (
                ["paid", "processing"].includes(order.status) && order.paymentInfo?.status === "captured" && Boolean(order.paymentInfo?.paymentId) && !["processing", "completed"].includes(order.cancellationStatus)
            ),
            willRefund: order.paymentInfo?.status === "captured",
            cancelledAt: order.cancelledAt,
            refundStatus: order.paymentInfo?.refundStatus,
            updatedAt: order.updatedAt,
            note: order.notes || "",
        }))

        return res.json({
            items: newOrders,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });


    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({ status: "failure", message: "Fetch user orders error." })
    }
};

// GET /api/user/wishlist
export const getWishlist = async (req, res) => {

    try {
        const user_id = req.user._id;

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        // Find wishlist
        const wishlist = await Wishlist.findOne({ user: user_id })
            .populate("products.product", " name price images rating category")
            .lean();

        if (!wishlist) return res.json({ products: [], total: 0, page, limit });

        // Total items
        const total = wishlist.products.length;

        // Sort newest first (by addedAt).
        const sorted = wishlist.products.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));

        // Manual pagination
        const paginated = sorted.slice(skip, skip + limit);

        return res.json({
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            items: paginated,
        });

    } catch (error) {
        console.error("Wish list add error:", error);
        res.status(500).json({ status: "failure", message: "Wishlist fetch error." });
    }
};

// POST /api/user/wishlist
export const addToUserWishlist = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { product_id } = req.body;

        // Check product exist.
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ status: "failure", message: "Product note found!" });

        // Check wishlist exist.
        let wishlist = await Wishlist.findOne({ user: user_id });
        // Create empty doc.
        if (!wishlist) {
            wishlist = new Wishlist({ user: user_id, products: [] });
        }

        // Check if product already exist.
        const already = wishlist.products.some(p => p.product.toString() === product_id?.toString());
        if (already) return res.status(400).json({ status: "failure", message: "Already in wishlist" });

        wishlist.products.push({
            product: product._id,
            priceAtAdd: product.price,
        });

        await wishlist.save();

        res.json({ status: "success", message: "Added to wishlist", wishlist });

    } catch (error) {
        console.error("Add to wishlist error:", error);
        res.status(500).json({ status: "failure", message: "Wishlist add error." });
    }
};

// DELETE /api/user/wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: user_id });
        if (!wishlist) return res.status(404).json({ status: "failure", message: "wishlist not found!" });


        wishlist.products = wishlist.products.filter(p => p.product.toString() !== productId);

        await wishlist.save();

        res.json({ status: "success", message: "Removed from wishlist", wishlist });

    } catch (error) {
        console.error("Wishlist delete error:", error);
        return res.status(500).json({ status: "failure", message: "Wishlist remove error." })
    }
};

// GET /api/user/banners
export const fetchBanners = async (req, res) => {
    try {

        const banner = await Banner.find().limit(6).exec();

        if (!banner) return res.status(404).json({ status: "failure", message: "Banner not found!" });

        res.json({ status: "success", banner });

    } catch (error) {
        console.error("Get banners error:", error);
        return res.status(500).json({ status: "failure", message: "Banners fetch error." })
    }
};
