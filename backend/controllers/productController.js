import Product from "../models/Product.js";
// import cloudinary from "../config/cloudinary.js";
import cloudinaryUpload from "../utils/cloudinaryUploader.js";
import { buildProductQuery } from "../helpers/productQuery.js";
import fs from "fs";
import cloudinaryDestroy from "../utils/cloudinaryDestroy.js";



// GET /api/products
// Supports: ?keyword=&category=&minPrice=&maxPrice=&inStock=true&sort=price,-rating&page=1&limit=12
export const getProducts = async (req, res) => {

    try {
        const isAdmin = Boolean(req.query.role === "admin");

        const q = buildProductQuery(req.query, isAdmin);

        // Sorting [default newest]
        let sort = "-createdAt";

        if (req.query.sort) {
            // sanitize: convert comma list into space-separated sort string for mongoose.
            sort = req.query.sort.split(",").join(" "); // "price,-rating" -> "price -rating"
        }

        // Pagination
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 15, 100);
        const skip = (page - 1) * limit;

        // find items + total count
        // const total = await Product.countDocuments(query);
        // const products = await Product.find(query)
        //     .skip(skip)
        //     .limit(parseInt(limit));


        const [items, total] = await Promise.all([
            Product.find(q).sort(sort).skip(skip).limit(limit).lean(),
            Product.countDocuments(q),
        ]);

        return res.json({
            items,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
        });


    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// GET /api/products/:id
export const getProductsById = async (req, res) => {
    try {

        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found!" });
        return res.status(200).json(product);


    } catch (error) {
        console.error("Get product error:", error);
        res.status(404).json({ success: false, message: "Failed to fetch product." })
    }
};

// POST /api/products [Admin only]
export const createProduct = async (req, res) => {
    try {

        // Check already uploaded this product.
        const productQuery = await Product.find({ name: req.body.name }).exec();

        if (!productQuery.length) {

            let images;

            if (req.files && req.files.length > 0) {
                // Handle cloudinary uploads
                images = await cloudinaryUpload(req.files, 'E_commerce/images');
            };

            const product = await Product.create({
                ...req.body,
                tags: JSON.parse(req.body.tags),
                questionAnswer: JSON.parse(req.body.questionAnswer),
                metadata: JSON.parse(req.body.metadata),
                images,
                createdBy: req.user.id,
            });

            res.status(201).json({ success: true, item: product });

        } else {
            res.status(200).json({ message: "Product already added!" });
        }

    } catch (error) {
        console.error("Create product error:", error);
        res.status(400).json({ success: false, message: "Invalid product data" });
    }
};

// PATCH /api/products/:id [Admin only]
export const updateProduct = async (req, res) => {
    try {
        const { id: productId } = req.params;

        // Find product by id
        const product = await Product.findById(productId);

        if (!product) {

            if (req.files && req.files.length > 0) {
                req.files.map(file => {
                    try { fs.unlinkSync(file.path); }
                    catch (error) { console.error("Temp file delete failed:", error); }
                });
            }
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.files && req.files.length > 0) {
            // Handle cloudinary uploads
            const newImages = await cloudinaryUpload(req.files, 'E_commerce/images');
            const imageToDelete = product.images.slice(0, newImages.length);

            // Delete the image from cloudinary.
            await cloudinaryDestroy(imageToDelete);

            // Append new images in to the remaining one.
            const remaining = product.images.slice(newImages.length);
            product.images = [...newImages, ...remaining];
        }

        // update other fields.
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        if (req.body.description) product.description = req.body.description;
        if (req.body.category) product.category = req.body.category;
        if (req.body.stock) product.stock = req.body.stock;
        if (req.body.sku) product.sku = req.body.sku;
        if (req.body.tags) product.tags = JSON.parse(req.body.tags);
        if (req.body.questionAnswer) product.questionAnswer = JSON.parse(req.body.questionAnswer);
        if (req.body.metadata) product.metadata = JSON.parse(req.body.metadata);

        await product.save();
        res.status(200).json({ success: true, product });

    } catch (error) {
        console.error("Update product error:", error);
        res.status(400).json({ success: false, message: "Invalid update data!" })
    }
};

// DELETE /api/products/:id [Admin only]
export const deleteProduct = async (req, res) => {
    try {

        const { id: productId } = req.params;

        // Find product by id
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found." });

        if (product.images.length > 0) {
            await cloudinaryDestroy(product.images);
        }

        const result = await product.deleteOne({ _id: productId });

        if (result.deletedCount === 1) {
            return res.status(200).json({ success: true, message: "Successfully deleted a product." })
        } else {
            res.status(404).json({ success: false, message: "No documents matched the query. Deleted 0 product." })
        }

    } catch (error) {
        console.error("Delete product error:", error);
        res.status(404).json({ success: false, message: "Invalid product id!" })
    }
};

// PUT /api/products/bulk/delete [Admin only]
export const deleteProductMany = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }

        const allProductImages = await Product.find({ _id: { $in: ids } }, 'images').exec();
        const allImages = allProductImages.flatMap(allImage => {
            return allImage.images;
        });

        await cloudinaryDestroy(allImages);
        await Product.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ success: true, message: "All products are deleted." })


    } catch (error) {
        console.error("Delete product many error:", error);
        res.status(404).json({ success: false, message: "Invalid product ids!" });
    }
};

// PUT /api/products/bulk/publish [Admin only]
export const updateProductStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || !status) {
            return res.status(400).json({ status: "failure", message: "Invalid request data." });
        }
        await Product.updateMany({ _id: { $in: ids } }, { $set: { status: status } });
        res.status(200).json({ success: true, message: "Product status is updated." });

    } catch (error) {
        console.error("Update product status error:", error);
        res.status(404).json({ success: false, message: "Invalid product ids!" });
    }
};

// GET /api/products/:id/reviews [auth users]
// POST /api/products/:id/reviews [auth users]
// DELETE /api/products/:id/reviews [auth users]
