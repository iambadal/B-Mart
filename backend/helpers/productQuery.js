
export const buildProductQuery = (query, isAdmin = false) => {
    const q = {};
    const andConditions = [];

    // 🔎 Keyword search (use $or for search only).
    if (query.keyword) {
        const keywordRegex = new RegExp(query.keyword, "i");
        andConditions.push({
            $or: [
                { name: keywordRegex },
                { description: keywordRegex },
                { tags: { $in: [keywordRegex] } }
            ]
        });
    }

    // 🏷️ Category filter.
    if (query.category) {
        const categories = query.category.split(",").map(c => c.trim()).filter(Boolean);
        if (categories.length > 0) {
            andConditions.push({ category: { $in: categories } });
        }
    }

    // ⭐ Rating filter.
    if (query.rating) {
        const rating = JSON.parse(query.rating);
        andConditions.push({ rating: { $gte: Math.min(...rating) } });
    }

    // 💰 Price filter.
    if (query.price) {
        const priceRange = JSON.parse(query.price);
        const priceConditions = priceRange.map(r => ({
            price: r.maxPrice === 0
                ? { $gte: r.minPrice }
                : { $gte: r.minPrice, $lte: r.maxPrice }
        }));
        andConditions.push({ $or: priceConditions });
    }

    // 📦 Stock filter.
    if (query.inStock === "true" || query.inStock === true) {
        andConditions.push({ stock: { $gt: 0 } });
    }

    // 🕒 New arrival filter.
    if (query.newArrival) {
        const currentDate = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        andConditions.push({ createdAt: { $gte: sevenDaysAgo } });
    }

    // 🧩 Tag filter.
    if (query.tags) {
        const tags = JSON.parse(query.tags);
        if (tags.length > 0) {
            andConditions.push({ tags: { $in: tags } });
        }
    }

    // 👮 Admin filters.
    if (isAdmin) {
        if (query.published === "true" || query.published === true)
            andConditions.push({ status: "Active" });
        if (query.unPublished === "true" || query.unPublished === true)
            andConditions.push({ status: "Inactive" });
        if (query.lowStock === "true" || query.lowStock === true)
            andConditions.push({ stock: { $lt: 10 } });
    } else {
        // 👥 Public filters.
        if (query.minPrice || query.maxPrice) {
            const price = {};
            if (query.minPrice) price.$gte = Number(query.minPrice);
            if (query.maxPrice) price.$lte = Number(query.maxPrice);
            andConditions.push({ price });
        }
        if (query.inStock === "true" || query.inStock === true) {
            andConditions.push({ stock: { $gt: 0 } });
        }
    }

    // 🧠 Final query.
    if (andConditions.length > 0) q.$and = andConditions;

    return q;
};
