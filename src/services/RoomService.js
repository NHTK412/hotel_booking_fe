import axios from "../config/AxiosConfig";

/**
 * 1. Lấy danh sách loại phòng của một khách sạn (Công khai)
 * GET /room-types/accommodations/{accommodationId}?page={page}&size={size}
 */
const getListRoomTypes = async ({
    accommodationId,
    page = 0,
    size = 10
}) => {
    try {
        const response = await axios.get(`/room-types/accommodations/${accommodationId}?page=${page}&size=${size}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 2. Xem chi tiết loại phòng (Công khai)
 * GET /room-types/{roomTypeId}
 */
const getRoomTypeDetail = async (roomTypeId) => {
    try {
        const response = await axios.get(`/room-types/${roomTypeId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3. Tạo loại phòng mới (Host)
 * POST /room-types
 * Body: RoomTypeRequestDTO
 */
const createRoomType = async (data) => {
    try {
        const response = await axios.post(`/room-types`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 4. Cập nhật toàn diện loại phòng (Host)
 * PUT /room-types/{roomTypeId}
 * Body: RoomTypeRequestDTO
 */
const updateRoomType = async (roomTypeId, data) => {
    try {
        const response = await axios.put(`/room-types/${roomTypeId}`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 5. Cập nhật nhanh Giá & Giảm giá (Host)
 * PATCH /room-types/{roomTypeId}?price={price}&discount={discount}
 */
const patchRoomTypePrice = async (roomTypeId, price, discount) => {
    try {
        const response = await axios.patch(`/room-types/${roomTypeId}?price=${price}&discount=${discount}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 6. Xóa loại phòng (Host)
 * DELETE /room-types/{roomTypeId}
 */
const deleteRoomType = async (roomTypeId) => {
    try {
        const response = await axios.delete(`/room-types/${roomTypeId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 7. Lấy danh sách các phòng vật lý thuộc loại phòng (Công khai)
 * GET /room-types/{roomTypeId}/rooms
 */
const getListRoomByRoomTypeId = async (roomTypeId) => {
    try {
        const response = await axios.get(`/room-types/${roomTypeId}/rooms`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 8. Thêm phòng vật lý vào loại phòng (Host)
 * POST /room-types/{roomTypeId}/rooms
 * Body: RoomRequestDTO { roomNumbers: string[] }
 */
const createMultipleRooms = async (roomTypeId, data) => {
    try {
        const response = await axios.post(`/room-types/${roomTypeId}/rooms`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 9. Xóa phòng vật lý (Host)
 * DELETE /room-types/{roomTypeId}/rooms
 * Body: number[] (mảng ID các phòng cần xóa)
 */
const deleteMultipleRooms = async (roomTypeId, roomIds) => {
    try {
        const response = await axios.delete(`/room-types/${roomTypeId}/rooms`, {
            data: roomIds,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 10. Tìm kiếm phòng còn trống theo ngày (Công khai)
 * GET /room-types/search
 */
const searchRoomTypes = async (params) => {
    try {
        const response = await axios.get(`/room-types/search`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 11. Lấy danh sách loại phòng của Host (Chọn cơ sở hoặc tất cả cơ sở)
 * GET /room-types/host?accommodationId={accommodationId}&page={page}&size={size}
 */
const getHostRoomTypes = async ({
    accommodationId,
    page = 0,
    size = 10
} = {}) => {
    try {
        const params = { page, size };
        if (accommodationId !== undefined && accommodationId !== null && accommodationId !== "") {
            params.accommodationId = accommodationId;
        }
        const response = await axios.get("/room-types/host", { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getListRoomTypes,
    getHostRoomTypes,
    getRoomTypeDetail,
    createRoomType,
    updateRoomType,
    patchRoomTypePrice,
    deleteRoomType,
    getListRoomByRoomTypeId,
    createMultipleRooms,
    deleteMultipleRooms,
    searchRoomTypes,
};
