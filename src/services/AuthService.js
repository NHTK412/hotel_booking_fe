import axios, { clearAuthData } from "../config/AxiosConfig";

const login = async (email, password) => {
    const data = {
        email,
        password,
    };
    return await axios.post("/auth/login", data);
};

const refreshToken = async (token) => {
    return await axios.post("/auth/refresh-token", { refreshToken: token });
};

const logout = async () => {
    try {
        await axios.post("/auth/logout");
    } finally {
        clearAuthData();
    }
};

const resetPassword = async (data) => {
    return await axios.post("/auth/reset-password", data);
};

export {
    login,
    refreshToken,
    logout,
    resetPassword
};