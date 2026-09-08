import axios from "../config/AxiosConfig";

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
        const params = {};
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;
        if (isDeleted !== undefined) params.isDeleted = isDeleted;
        const response = await axios.get(`/users/accommodation/${hotelId}`, { params });
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

const registerHost = async (data) => {
    try {
        const response = await axios.post("/users/host", data);
        return response;
    } catch (error) {
        throw error;
    }
};

const getAllStaff = async (params = {}) => {
    try {
        const response = await axios.get("/users/staff", { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getUserInfo,
    getListHotel,
    updateUserInfo,
    getStaffByHotel,
    createStaff,
    deleteStaff,
    restoreStaff,
    getUserById,
    addStaffByEmail,
    registerHost,
    getAllStaff
}