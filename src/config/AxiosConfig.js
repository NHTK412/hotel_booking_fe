import axios from "axios";

const instance = axios.create(
    {
        baseURL: import.meta.env.VITE_BACKEND_URL
    }
)

const whitelist = ["/auth/login", "/auth/register"];

instance.interceptors.request.use(
    (config) => {
        if (config.url && whitelist.some((path) => config.url.includes(path))) {
            return config;
        }

        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;

    }
)

instance.interceptors.response.use(
    (response) => {
        return response.data;
    }
);


export default instance;