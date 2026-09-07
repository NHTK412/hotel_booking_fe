import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const whitelist = ["/auth/login", "/auth/register", "/auth/refresh-token"];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("hotelCurrent");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userRole");
};

// Request Interceptor: Tự động đính kèm accessToken
instance.interceptors.request.use(
    (config) => {
        if (config.url && whitelist.some((path) => config.url.includes(path))) {
            return config;
        }

        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Tự động refresh token khi gặp mã lỗi 401
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        const isWhitelist = originalRequest?.url && whitelist.some((path) => originalRequest.url.includes(path));

        if (error.response?.status === 401 && !originalRequest._retry && !isWhitelist) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const isSession = !!sessionStorage.getItem("accessToken");
            const storage = isSession ? sessionStorage : localStorage;
            const refreshToken = storage.getItem("refreshToken") || localStorage.getItem("refreshToken");

            if (!refreshToken) {
                clearAuthData();
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(error.response?.data || error);
            }

            try {
                // Gọi API refresh token bằng axios gốc để tránh vòng lặp interceptor
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken,
                });

                const newAccessToken = response.data?.data?.accessToken;
                const newRefreshToken = response.data?.data?.refreshToken;

                if (newAccessToken) {
                    storage.setItem("accessToken", newAccessToken);
                    if (newRefreshToken) {
                        storage.setItem("refreshToken", newRefreshToken);
                    }

                    instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                } else {
                    throw new Error("Không nhận được token mới từ hệ thống");
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthData();
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError.response?.data || refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default instance;