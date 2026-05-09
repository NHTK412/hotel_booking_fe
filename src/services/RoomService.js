import axios from "../config/axiosConfig";

const getListRoomTypes = async ({
    accommodationId,
    page = 0,
    size = 10
}) => {
    try {
        const response = await axios.get(`/room-types/accommodations/${accommodationId}/page?page=${page}&size=${size}`);
        return response;
    } catch (error) {
        throw error;
    }
}

const getRoomTypeDetail = async (roomTypeId) => {
    try {
        const response = await axios.get(`/room-types/${roomTypeId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

const getListRoomByRoomTypeId = async (roomTypeId) => {
    try {
        const response = await axios.get(`/room-types/${roomTypeId}/rooms`);
        return response;
    } catch (error) {
        throw error;
    }
}

const updateRoomType = async (roomTypeId, data) => {
    try {
        // console.log("Gửi yêu cầu cập nhật loại phòng với data: ", data);
        // console.log("ID loại phòng cần cập nhật: ", roomTypeId);
        const response = await axios.put(`/room-types/${roomTypeId}`, data);
        return response;
    }
    catch (error) {
        throw error;
    }
};

const createMultipleRooms = async (roomTypeId, data) => {
    try {
        const response = await axios.post(`/room-types/${roomTypeId}/rooms`, data);
        return response;
    } catch (error) {
        throw error;
    }
}

const updateStatusRoom = async (roomTypeId, roomId, status) => {
    try {
        const response = await axios.patch(`/room-types/${roomTypeId}/rooms/${roomId}?status=${status}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getListRoomTypes,
    getRoomTypeDetail,
    getListRoomByRoomTypeId,
    updateRoomType,
    createMultipleRooms,
    updateStatusRoom
}