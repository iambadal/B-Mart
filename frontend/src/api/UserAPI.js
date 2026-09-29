import axios from "axios";
import buildQuery from "../utils/buildQuery";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
});

export const fetchUserData = async ({ queryKey }) => {

    try {
        const response = await API.get(`/api/user`, {
            headers: { Authorization: `Bearer ${queryKey[1]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch user data error:", error);
        return error.response?.data || "User data Fetching error!";
    }

};

export const updateUser = async (formData, token) => {
    try {
        const response = await API.post(`/api/user`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Update user error:", error);
        return error.response?.data || "User data update error!";
    }
};

export const deleteUser = async (token) => {
    try {
        const response = await API.delete(`/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Delete user error:", error);
        return error?.response?.data || "Account delete error.";
    }
};

export const fetchAddress = async ({ queryKey }) => {
    try {
        const response = await API.get(`/api/user/address`, {
            headers: { Authorization: `Bearer ${queryKey[1]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch address error:", error);
        return error.response?.data || "Address Fetching error!";
    }

};

export const updateAddress = async (formData, token) => {
    try {
        const response = await API.post(`/api/user/address`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Update address error:", error);
        return error.response?.data || "User address update error!";
    }
};

export const userReviews = async ({ pageParam, queryKey }) => {
    try {
        const params = buildQuery({ ...queryKey[1], pageParam: pageParam });

        const response = await API.get(`/api/user/reviews?${params}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch user reviews error:", error);
        return error.response?.data || "User reviews Fetching error!";
    }
};

export const addUserProductReviews = async (formData, token, productId) => {
    try {
        const response = await API.post(`/api/user/reviews/${productId}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Add product reviews error:", error);
        return error.response?.data || "Product reviews error!";
    }
};

export const deleteUserProductReviews = async (token, productId) => {
    try {
        const response = await API.delete(`/api/user/reviews/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Delete product reviews error:", error);
        return error.response?.data || "Delete product reviews error!";
    }
};

export const userOrders = async ({ pageParam, queryKey }) => {
    try {
        const params = buildQuery({ ...queryKey[1], pageParam: pageParam });

        const response = await API.get(`/api/user/orders?${params}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch user orders error:", error);
        return error.response?.data || "User orders Fetching error!";
    }
};

export const userWishlists = async ({ pageParam, queryKey }) => {
    try {
        const params = buildQuery({ ...queryKey[1], pageParam: pageParam });

        const response = await API.get(`/api/user/wishlist?${params}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch user wishlist error:", error);
        return error.response?.data || "User wishlist Fetching error!";
    }
};

export const addUserWishlist = async (formData, token) => {
    try {
        console.log("called");

        const response = await API.post("/api/user/wishlist", formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Add wishlist error:", error);
        return error.response?.data || "User wishlist add error.";
    }
};

export const deleteUserWishlist = async (token, productId) => {
    try {
        const response = await API.delete(`/api/user/wishlist/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("User wishlist delete error:", error);
        return error.response?.data || "User wishlist delete error.";
    }
};


export const fetchBanners = async ({ queryKey }) => {

    try {
        const response = await API.get(`/api/user/banners`, {
            headers: { Authorization: `Bearer ${queryKey[1]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch user data error:", error);
        return error.response?.data || "User data Fetching error!";
    }

};
