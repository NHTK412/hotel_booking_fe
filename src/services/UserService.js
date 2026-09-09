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
        const response = await axios.get("/accommodations/my");
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
const getStaffByAccommodation = async (accommodationId, isDeleted = false, page = 0, size = 10) => {
    try {
        const params = { isDeleted, page, size };
        const response = await axios.get(`/users/accommodation/${accommodationId}`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

const getStaffByHotel = async (hotelId, page, size, isDeleted = false) => {
    return getStaffByAccommodation(hotelId, isDeleted, page, size);
};

const createStaff = async (hotelId, data) => {
    try {
        const response = await axios.post(`/users/accommodation/${hotelId}`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Đánh dấu nhân viên nghỉ việc (Soft delete nhân sự tại khách sạn)
 * DELETE /users/staff/{accommodationStaffId}
 */
const deleteStaff = async (staffIdOrHotelId, maybeStaffId) => {
    const accommodationStaffId = maybeStaffId !== undefined ? maybeStaffId : staffIdOrHotelId;
    try {
        const response = await axios.delete(`/users/staff/${accommodationStaffId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Khôi phục nhân sự đi làm lại
 * PATCH /users/staff/{accommodationStaffId}/restore
 */
const restoreStaff = async (staffIdOrHotelId, maybeStaffId) => {
    const accommodationStaffId = maybeStaffId !== undefined ? maybeStaffId : staffIdOrHotelId;
    try {
        const response = await axios.patch(`/users/staff/${accommodationStaffId}/restore`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Khóa / Mở khóa tài khoản người dùng (Admin)
 * PATCH /users/{userId}/status?status={status}
 */
const patchUserStatus = async (userId, status) => {
    try {
        const response = await axios.patch(`/users/${userId}/status?status=${status}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Xóa mềm tài khoản người dùng (Admin)
 * DELETE /users/{userId}
 */
const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`/users/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Khôi phục tài khoản người dùng đã xóa mềm (Admin)
 * PATCH /users/{userId}/restore
 */
const restoreUser = async (userId) => {
    try {
        const response = await axios.patch(`/users/${userId}/restore`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getUserById = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

const addStaffByEmail = async (hotelId, data) => {
    try {
        const response = await axios.post(`/users/accommodation/${hotelId}/staff`, data);
        return response;
    }
    catch (error) {
        throw error;
    }
};

const registerHost = async (data) => {
    try {
        const response = await axios.post("/users/host", data);
        return response;
    } catch (error) {
        throw error;
    }
};

const getAllStaff = async ({ accommodationId, role, keyword, isDeleted } = {}) => {
    try {
        const params = {};
        if (isDeleted !== undefined && isDeleted !== null) {
            params.isDeleted = isDeleted;
        }
        if (accommodationId !== undefined && accommodationId !== null && accommodationId !== "" && accommodationId !== "ALL") {
            params.accommodationId = accommodationId;
        }
        if (role !== undefined && role !== null && role !== "" && role !== "ALL") {
            params.role = role;
        }
        if (keyword !== undefined && keyword !== null && keyword !== "") {
            params.keyword = keyword;
        }
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
    getStaffByAccommodation,
    createStaff,
    deleteStaff,
    restoreStaff,
    patchUserStatus,
    deleteUser,
    restoreUser,
    getUserById,
    addStaffByEmail,
    registerHost,
    getAllStaff
};