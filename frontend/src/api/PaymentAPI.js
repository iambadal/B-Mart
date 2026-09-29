import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Allow cookies & sessions to be sent.
});

export const createRazorpayOrder = async (orderId, amount, token) => {
    try {
        const response = await API.post("/api/payment/order", JSON.stringify({ amount, orderId }), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;

    } catch (error) {
        console.error("Create razorpay order error:", error);
        return error.response?.data ?? "Razorpay order error.";
    }
};

export const verifyPayment = async (data, token) => {
    try {
        const response = await API.post("/api/payment/verify", JSON.stringify({ ...data }), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Verify payment error:", error);
        return error.response?.data ?? "Payment verification error."
    }
};
