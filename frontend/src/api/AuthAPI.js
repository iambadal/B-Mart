import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export const register = async (formData) => {
    try {
        const { data } = await API.post("/api/auth/register", formData);
        return data;
    } catch (error) {
        console.error("Register API Error:", error);
        return error.response?.data || "Registration failed";
    }
};

export const login = async (formData) => {
    try {
        const { data } = await API.post("/api/auth/login", formData);
        return data;
    } catch (error) {
        console.error("Login API Error:", error);
        return error.response?.data || "Login failed";
    }
};

export const forgotPassword = async (formData) => {
    try {
        const { data } = await API.post("/api/auth/forgot-pwd", formData);
        return data;
    } catch (error) {
        console.error("Forgot password error:", error);
        return error.response?.data || "Forgot failed";
    }
};

export const resetPassword = async (formData) => {
    try {
        const { data } = await API.post("/api/auth/reset-pwd", formData);
        return data;
    } catch (error) {
        console.error("Reset password error:", error);
        return error.response?.data || "Reset failed";
    }
};

export const verifyEmail = async (token) => {
    try {
        const { data } = await API.get(`/api/auth/verify-email/${token}`);
        return data;
    } catch (error) {
        return error.response?.data || { status: "failure", message: "Email verification failed." };
    }
};

export const resendVerification = async (email) => {
    try {
        const { data } = await API.post("/api/auth/resend-verification", { email });
        return data;
    } catch (error) {
        return error.response?.data || { status: "failure", message: "Could not send verification email." };
    }
};

export const logout = async () => {
    try {
        const { data } = await API.post("/api/auth/logout", {});
        return data;
    } catch (error) {
        console.error("Logout API Error:", error);
        return error.response?.data || "Logout failed";
    }
};
