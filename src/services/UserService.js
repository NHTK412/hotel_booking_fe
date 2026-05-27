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
const getStaffByHotel = async (hotelId, page, size, isDeleted) => {
    try {
        const response = await axios.get(`/users/accommodation/${hotelId}?page=${page}&size=${size}&isDeleted=${isDeleted}`);
        return response;
    } catch (error) {
        throw error;
    }
}

const createStaff = async (hotelId, data) => {
    try {
        const response = await axios.post(`/users/accommodation/${hotelId}`, data);
        return response;
    } catch (error) {
        throw error;
    }
}

const deleteStaff = async (hotelId, staffId) => {
    try {
        const response = await axios.delete(`users/accommodation/${hotelId}/staff/${staffId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

const restoreStaff = async (hotelId, staffId) => {
    try {
        const response = await axios.patch(`users/accommodation/${hotelId}/staff/${staffId}/restore`);
        return response;
    } catch (error) {
        throw error;
    }
}

const getUserById = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

const addStaffByEmail = async (hotelId, data) => {
    try {
        const response = await axios.post(`/users/accommodation/${hotelId}/staff`, data);
        return response;
    }
    catch (error) {
        throw error;
    }
}

export {
    getUserInfo,
    getListHotel,
    updateUserInfo,
    getStaffByHotel,
    createStaff,
    deleteStaff,
    restoreStaff,
    getUserById,
    addStaffByEmail
}