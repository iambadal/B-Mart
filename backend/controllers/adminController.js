import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import cloudinaryDestroy from "../utils/cloudinaryDestroy.js";
import userDelete from "../utils/userDeletes.js";
import Banner from "../models/Banner.js";
import cloudinaryUpload from "../utils/cloudinaryUploader.js";

// GET /api/admin/summary.
export const summary = async (req, res) => {
    try {

        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate revenue.
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
        });

    } catch (error) {
        console.error("Get summary error:", error);
        res.status(500).json({ status: "failure", message: "Fetch summary error." });
    }
};

// GET /api/admin/sales.
export const salesPerMonth = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalRevenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return res.json(sales)
    } catch (error) {
        console.error("Get sales per month error:", error);
        res.status(500).json({ status: "failure", message: "Fetch sales per month error." });
    }
};

// GET /api/admin/category-distribution.
export const categoryDistribution = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(categories);

    } catch (error) {
        console.error("Get category distribution error:", error);
        res.status(500).json({ status: "failure", message: "fetch category distribution error." });
    }
};

// GET /api/admin/stock-status.
export const stockStatus = async (req, res) => {
    try {
        const stock = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalStock: { $sum: "$stock" }
                }
            }
        ]);

        res.json(stock);

    } catch (error) {
        console.error("Get stock status error:", error);
        res.status(500).json({ status: "failure", message: "Fetch stock status error." });
    }
};

// GET /api/admin/users.
export const usersList = async (req, res) => {
    try {
        const query = req.query;
        let q = {};

        // Filter by search...
        if (query.keyword) {
            const keyword = query.keyword.trim();
            const orCondition = [
                { "username": { $regex: keyword, $options: "i" } },
                { "email": { $regex: keyword, $options: "i" } },
            ];
            // If keyword is a valid ObjectId, add _id search.
            if (mongoose.Types.ObjectId.isValid(keyword)) {
                orCondition.push({ _id: new mongoose.Types.ObjectId(keyword) });
            }

            q.$or = orCondition
        };

        // Filter by user types...
        if (query.userTypes === "Admin") q.role = "admin";
        if (query.userTypes === "Customer") q.role = "user";
        if (query.userTypes === "Blocked") q.status = "Banned";

        // Sort..
        let sort = "-createdAt";

        // Pagination
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            User.find(q).select("-refreshToken").sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(q),
        ]);

        return res.json({
            items,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Get users data error:", error);
        res.status(500).json({ status: "failure", message: "Fetch users data error." });
    }
};

// POST /api/admin/users.
export const userStatusUpdate = async (req, res) => {
    try {

        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0 || !status) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }

        await User.updateMany({ _id: { $in: ids } }, { $set: { status: status } });
        res.status(200).json({ status: "success", message: "User status is updated." });

    } catch (error) {
        console.error("User status update error:", error);
        res.status(500).json({ status: "failure", message: "User status update error." });
    }
};

// PATCH /api/admin/users/:id.
export const userRoleUpdate = async (req, res) => {
    try {
        const { ids, role } = req.body;

        if (!Array.isArray(ids) || ids.length === 0 || !role) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }

        const updatedUsers = [];

        for (const id of ids) {
            const user = await User.findById(id);
            if (!user) continue; // skip if user not found...

            // Toggle role.
            if (role === "toggle") {
                user.role = user.role === "admin" ? "user" : "admin";
            } else {
                user.role = role; // assign directly if specific role is passed...
            }

            await user.save();
            updatedUsers.push({ id: user._id, role: user.role });
        }

        return res.status(200).json({
            status: "success",
            message: "User roles updated successfully.",
            data: updatedUsers,
        });

    } catch (error) {
        console.error("User role update error:", error);
        res.status(500).json({ status: "failure,", message: "User role update error." });
    }
};

// PUT /api/admin/users.
export const usersDelete = async (req, res) => {

    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }
        await userDelete(ids, true)
        res.status(200).json({ status: "success", message: "User and all data deleted permanently" })

    } catch (error) {
        console.error("User status update error:", error);
        res.status(500).json({ status: "failure", message: "User status update error." });
    }

};

// GET /api/admin/banner
export const getAllBanners = async (req, res) => {
    try {

        const query = req.query;
        let q = {};
        // filter by search
        if (query.keyword) {
            const keyword = query.keyword.trim();
            const orCondition = [
                { "title": { $regex: keyword, $options: 'i' } }
            ];
            // If keyword is a valid ObjectId, add _id search.
            if (mongoose.Types.ObjectId.isValid(keyword)) {
                orCondition.push({ _id: new mongoose.Types.ObjectId(keyword) });
            }
            q.$or = orCondition;
        }
        // sort
        const sort = "-createdAt";
        // Paginate
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Banner.find(q).sort(sort).skip(skip).limit(limit).lean(),
            Banner.countDocuments(q),
        ]);

        // output
        return res.json({
            items,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Get banners error:", error);
        return res.status(500).json({ status: "failure", message: "Banners fetch error." });
    }
};
// POST /api/admin/banner
export const createBanner = async (req, res) => {
    try {

        // check same banner already created
        const bannerQuery = await Banner.find({ title: req.body.title }).exec();

        if (!bannerQuery.length) {

            let image;

            if (req.file) {
                // Handle cloudinary uploads
                image = await cloudinaryUpload([req.file], 'E_commerce/banners');
            }else {
                return res.status(400).json({status:"failure", message: "Please upload a image!"});
            }

            const banner = await Banner.create({
                ...req.body,
                banner: image[0],
                createdBy: req.user.id,
            });

            res.status(201).json({ status: "success", message: "Banner is successfully created." });

        } else {
            res.status(200).json({ status: "failure", message: "Banner is already added!" });
        }

    } catch (error) {
        console.error("Create banner error:", error);
        return res.status(500).json({ status: "failure", message: "Banner create error." });
    }
};
// PUT /api/admin/banner/:id
export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, category } = req.body;

        const bannerOld = await Banner.findById(id);
        if (!bannerOld && req.file) {
            try { fs.unlinkSync(req.file?.path); }
            catch (error) { console.error("Temp file delete failed:", error); }
            return res.status(404).json({ status: "failure", message: "Banner not found!" });
        }
        // Upload new banner if exist.
        if (req.file) {
            if (bannerOld?.banner.public_id) await cloudinaryDestroy([{ public_id: bannerOld?.banner.public_id }]);;
            const image = await cloudinaryUpload([req.file], 'E_commerce/banners');
            bannerOld.banner = image[0];
        }
        // Update new data...
        if (title !== bannerOld.title && title) bannerOld.title = title;
        if (subtitle !== bannerOld.subtitle && subtitle) bannerOld.subtitle = subtitle;
        if (category !== bannerOld.category && category) bannerOld.category= category;

        await bannerOld.save();
        res.status(202).json({ status: "success", message: "Banner is updated." })

    } catch (error) {
        console.error("Update banner error:", error);
        return res.status(500).json({ status: "failure", message: "Banner update error." });
    }
};
// PUT /api/admin/banner
export const deleteBanners = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids) return res.status(404).json({ status: "failure", message: "No banner IDs provided" });

        // 1: delete banners in cloudinary.
        const banners = await Banner.find({ _id: { $in: ids } }, 'banner').exec();
        const flatBanners = banners.flatMap(b => {
            return b.banner
        })
        await cloudinaryDestroy(flatBanners);

        await Banner.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ status: "success", message: "Banner deleted." })

    } catch (error) {
        console.error("Delete banners error:", error);
        return res.status(500).json({ status: "failure", message: "Banners delete error." });
    }
};

