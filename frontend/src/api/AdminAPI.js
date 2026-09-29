import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    withCredentials: true, // Allow cookies & sessions to be sent.
});


export const summary = async ({ queryKey }) => {

    try {
        const response = await API.get("/api/admin/summary", {
            headers: { Authorization: `Bearer ${queryKey[1]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch summary error:", error);
        return error.response?.data || "Fetch summary data error.";
    }
};

export const dashboardDataAPIs = () => {

    const salesAPI = async ({ queryKey }) => {
        try {
            const response = await API.get("/api/admin/sales", {
                headers: { Authorization: `Bearer ${queryKey[1]}` }
            });

            return response.data;

        } catch (error) {
            console.error("Get sales per month error:", error);
            return error.response?.data || "Fetch sales per month error.";
        }
    };

    const categoryDistributionAPI = async ({ queryKey }) => {
        try {
            const response = await API.get("/api/admin/category-distribution", {
                headers: { Authorization: `Bearer ${queryKey[1]}` }
            });

            return response.data;

        } catch (error) {
            console.error("Get category distribution error:", error);
            return error.response?.data || "Fetch category distribution error.";
        }
    };

    const stockStatusAPI = async ({ queryKey }) => {
        try {

            const response = await API.get("/api/admin/stock-status", {
                headers: { Authorization: `Bearer ${queryKey[1]}` }
            });

            return response.data;

        } catch (error) {
            console.error("Get stock status error:", error);
            return error.response.data || "Fetch stock status error.";
        }
    };

    return { salesAPI, categoryDistributionAPI, stockStatusAPI };
};

export const fetchUsersList = async ({ queryKey }) => {

    try {
        // const [_key, { filters, page, limit, sort }, token] = queryKey;
        const { filters, page, limit, sort } = queryKey[1];

        const params = new URLSearchParams();
        if (filters.search) params.append("keyword", filters.search);
        if (filters.userType) params.append("userTypes", filters.userType);
        params.append("page", page);
        params.append("limit", limit);
        if (sort) params.append("sort", sort);

        const response = await API.get(`/api/admin/users?${params.toString()}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch users list error:", error);
        return error.response?.data || "Users list Fetching error.";
    }

};

export const updateUserStatus = async (token, ids, status) => {

    try {
        const response = await API.post("/api/admin/users/status-update", { ids, status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Update user status error:", error);
        return error.response?.data || "Update user status error.";
    }
};

export const updateUserRole = async (token, ids, role) => {
    ;

    try {
        const response = await API.post("/api/admin/users/role-update", { ids, role }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Update user role error:", error);
        return error.response?.data || "Update user role error.";
    }
};

export const deleteUsers = async (token, ids) => {
    try {

        const response = await API.put("/api/admin/users", { ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;

    } catch (error) {
        console.error("Delete users error:", error);
        return error.response?.data || "Delete users error.";
    }
};

export const getAllBanners = async ({ queryKey }) => {
    try {
        // const [_key, { filters, page, limit, sort }, token] = queryKey;
        const { search, page, limit, sort } = queryKey[1];

        const params = new URLSearchParams();
        if (search) params.append("keyword", search);
        params.append("page", page);
        params.append("limit", limit);
        if (sort) params.append("sort", sort);

        const response = await API.get(`/api/admin/banner?${params.toString()}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch banner list error:", error);
        return error.response?.data || "Banners list Fetching error.";
    }

};

export const createBanner = async (fd, token) => {
    try {
        const response = await API.post("/api/admin/banner", fd, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;

    } catch (error) {
        console.error("Create banner error:", error);
        return error.response?.data || "Create banner error.";
    }

};

export const updateBanner = async (fd, token, id) => {
    try {
        const response = await API.put(`/api/admin/banner/${id}`, fd, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Update banner error:", error);
        return error.response?.data || "Update banner error.";
    }

};

export const deleteBanners = async (token, ids) => {
    try {
        const response = await API.put("/api/admin/banner", { ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Delete banners error:", error);
        return error.response?.data || "Delete banners error.";
    }

};
