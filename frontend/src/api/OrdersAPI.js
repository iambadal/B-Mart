import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, 
});

export const createOrderAndReserve = async (data, token) => {

    try {
        const response = await API.post("/api/orders", JSON.stringify(data), {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;

    } catch (error) {
        console.error("Create order and reserve error:", error);
        return error.response?.data ?? "Product order error.";
    }
};

export const recentOrders = async ({ queryKey }) => {
    try {
        const response = await API.get("api/orders/recent", {
            headers: { Authorization: `Bearer ${queryKey[1]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Get recent orders error:", error);
        return error.response?.data || "Fetch recent orders error.";
    }
};

export const fetchOrders = async ({ queryKey }) => {

    try {
        // const [_key, { filters, page, limit, sort }, token] = queryKey;
        const { filters, page, limit, sort } = queryKey[1];

        const params = new URLSearchParams();
        if (filters.search) params.append("keyword", filters.search);
        if (filters.status) params.append("status", filters.status);
        params.append("page", page);
        params.append("limit", limit);
        if (sort) params.append("sort", sort);

        const response = await API.get(`/api/orders?${params.toString()}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` }
        });

        return response.data;

    } catch (error) {
        console.error("Fetch orders error:", error);
        return error.response?.data || "Orders Fetching error.";
    }

};

export const updateOrderStatus = async (token, ids, status, notes) => {
    try {

        const response = await API.post("/api/orders/update", JSON.stringify({ ids, status, notes }), {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;

    } catch (error) {
        console.error("Update order status error:", error);
        return error.response?.data || "Update order status error.";
    }
}

export const deleteOrders = async (token, ids) => {
    try {

        const response = await API.post("/api/orders/delete", JSON.stringify({ ids }), {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;

    } catch (error) {
        console.error("Delete orders error:", error);
        return error.response?.data || "Delete orders error.";
    }
}