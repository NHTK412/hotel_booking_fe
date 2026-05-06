import axios from "../config/axiosConfig";

const getUserInfo = async () => {
    try {
        const response = await axios.get("/users/me");
        return response;
    } catch (error) {
        throw error;
    }
}

const getListHotel = async () => {
    try {
        const response = await axios.get("/accommodations/user/me");
        return response;
    } catch (error) {
        throw error;
    }
}

const updateUserInfo = async (data) => {
    try {
        const response = await axios.put("/users/me", data);
        return response;
    } catch (error) {
        throw error;
    }
}

export {
    getUserInfo,
    getListHotel,
    updateUserInfo
}