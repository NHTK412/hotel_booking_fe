import axios from "../config/axiosConfig";

const getUserInfo = async () => {
    try {
        const response = await axios.get("/users/me");
        return response;
    } catch (error) {
        throw error;
    }
}

export {
    getUserInfo
}