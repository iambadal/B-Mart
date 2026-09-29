
const buildQuery = ({ filters, page, pageParam, limit, sort }) => {
    const q = new URLSearchParams();
    if (filters?.search) q.append("keyword", filters.search);
    if (filters?.tags) q.append("tags", JSON.stringify(filters.tags));

    // Admin only filters
    if (filters?.published) q.append("published", "true");
    if (filters?.unPublished) q.append("unPublished", "true");
    if (filters?.lowStock) q.append("lowStock", "true");

    // Public filters
    if (filters?.category?.length) q.append("category", filters.category);
    if (filters?.price?.length) q.append("price", JSON.stringify(filters.price));
    if (filters?.rating?.length) q.append("rating", JSON.stringify(filters.rating));
    if (filters?.newArrival?.length) q.append("newArrival", JSON.stringify(filters.newArrival));
    if (filters?.inStock?.length) q.append("inStock", JSON.stringify(filters.inStock));

    if (filters?.minPrice) q.append("minPrice", filters.minPrice);
    if (filters?.maxPrice) q.append("maxPrice", filters.maxPrice);

    // pageParam for infinite scroll, otherwise use page...
    const finalPage = pageParam || page || 1;
    q.append("page", finalPage);

    q.append("limit", limit);

    if (sort) q.append("sort", sort);

    return q.toString();
};

export default buildQuery