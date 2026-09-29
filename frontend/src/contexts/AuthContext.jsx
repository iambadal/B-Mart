import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import Loader from "../components/Loader";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";

  // 1. Initial Authentication Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/auth/refresh`, {
          withCredentials: true,
        });

        setAccessToken(data?.accessToken);
        setUser(data.user);
        setDisabled(false);
      } catch (err) {
        console.log("Session expired or no active session found.");
        setAccessToken(null);
        setUser(null);
        setDisabled(true);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  // 2. Attach Access Token to ALL future Axios requests
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  // 3. Axios Interceptor for Silent Token Refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;

        if (originalRequest.url.includes("/auth/refresh")) {
          return Promise.reject(err);
        }

        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.get(`${BACKEND_URL}/api/auth/refresh`, {
              withCredentials: true,
            });

            setAccessToken(data?.accessToken);
            setUser(data?.user);
            setDisabled(false);

            // Update the failed request with the new token and retry
            originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            setAccessToken(null);
            setUser(null);
            setDisabled(true);
            navigate("/login");
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, accessToken, setAccessToken, loading, disabled }}
    >
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);