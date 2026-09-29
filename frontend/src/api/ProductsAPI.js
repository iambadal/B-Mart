import axios from "axios";
import buildQuery from "../utils/buildQuery";


const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true, // Allow cookies & sessions to be sent.
});


export const fetchProducts = async ({ pageParam, queryKey }) => {

    // const [_key, { filters, page, limit, sort }, token] = queryKey;

    const params = buildQuery({ ...queryKey[1], pageParam: pageParam });

    try {
        const response = await API.get(`/api/products?${params}&role=${queryKey[2]}`);
        return response.data;

    } catch (error) {
        console.error("Fetch product error:", error);
        return error.response?.data || "Products Fetching error!";
    }

}

export const fetchProductsById = async ({ queryKey }) => {

    try {
        const response = await API.get(`/api/products/${queryKey[1]}`);
        return response.data;

    } catch (error) {
        console.error("Fetch product by id error:", error);
        return error.response?.data || "Product Fetching error!";
    }

}

export const createProduct = async (formData, token) => {

    try {
        const response = await API.post("/api/products", formData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;

    } catch (error) {
        console.error("Create product error:", error);
        return error.response?.data || "Product creation error!";
    }
};

export const updateProduct = async (formData, token, productId) => {
    try {
        const response = await API.patch(`/api/products/${productId}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Update product error:", error);
        return error.response?.data || "Product update error!";
    }
};

export const deleteProduct = async (token, productId) => {
    try {
        const response = await API.delete(`/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;

    } catch (error) {
        console.error("Delete product error:", error);
        return error.response?.data ?? "Product delete error!";
    }
};

export const deleteProductMany = async (token, ids) => {

    try {
        const response = await API.put("/api/products/bulk/delete", { ids }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;

    } catch (error) {
        console.error("Delete product many error:", error);
        return error.response?.data ?? "Can't delete all products!";
    }
};

export const updateProductStatus = async (token, ids, status) => {

    try {
        const response = await API.put("/api/products/bulk/status", { ids, status }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;

    } catch (error) {
        console.error("Update product status error:", error);
        return error.response?.data ?? "Can't change products status!";
    }
};


