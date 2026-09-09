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
 * 7. Lấy danh sách các phòng vật lý thuộc loại phòng (hỗ trợ lọc isDeleted)
 * GET /room-types/{roomTypeId}/rooms?isDeleted={isDeleted}
 */
const getListRoomByRoomTypeId = async (roomTypeId, isDeleted = false) => {
    try {
        const response = await axios.get(`/room-types/${roomTypeId}/rooms`, {
            params: { isDeleted }
        });
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
 * 9. Cập nhật thông tin phòng vật lý (Host)
 * PUT /room-types/{roomTypeId}/rooms/{roomId}
 * Body: { roomNumber: string, status?: "ACTIVE" | "INACTIVE" }
 */
const updatePhysicalRoom = async (roomTypeId, roomId, data) => {
    try {
        const response = await axios.put(`/room-types/${roomTypeId}/rooms/${roomId}`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 10. Xóa phòng vật lý (Host)
 * DELETE /room-types/{roomTypeId}/rooms
 * Body: number[] (mảng ID các phòng cần xóa)
 */
const deleteMultipleRooms = async (roomTypeId, roomIds) => {
    try {
        const ids = Array.isArray(roomIds) ? roomIds : [roomIds];
        const response = await axios.delete(`/room-types/${roomTypeId}/rooms`, {
            data: ids,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Khôi phục danh sách phòng vật lý đã xóa mềm (Host)
 * PATCH /room-types/{roomTypeId}/rooms/restore
 * Body: number[] (mảng ID các phòng cần khôi phục)
 */
const restorePhysicalRooms = async (roomTypeId, roomIds) => {
    try {
        const ids = Array.isArray(roomIds) ? roomIds : [roomIds];
        const response = await axios.patch(`/room-types/${roomTypeId}/rooms/restore`, ids);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 11. Tìm kiếm phòng còn trống theo ngày (Công khai)
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
 * 12. Lấy danh sách loại phòng của Host (Chọn cơ sở hoặc tất cả cơ sở, lọc đã xóa)
 * GET /room-types/host?accommodationId={accommodationId}&isDeleted={isDeleted}&page={page}&size={size}
 */
const getHostRoomTypes = async ({
    accommodationId,
    isDeleted = false,
    page = 0,
    size = 10
} = {}) => {
    try {
        const params = { page, size, isDeleted };
        if (accommodationId !== undefined && accommodationId !== null && accommodationId !== "") {
            params.accommodationId = accommodationId;
        }
        const response = await axios.get("/room-types/host", { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 13. Khôi phục loại phòng đã bị xóa mềm (Host)
 * PATCH /room-types/{roomTypeId}/restore
 */
const restoreRoomType = async (roomTypeId) => {
    try {
        const response = await axios.patch(`/room-types/${roomTypeId}/restore`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 14. Đổi nhanh trạng thái hoạt động loại phòng (ACTIVE <-> INACTIVE)
 * PATCH /room-types/{roomTypeId}/status?status={status}
 */
const patchRoomTypeStatus = async (roomTypeId, status) => {
    try {
        const response = await axios.patch(`/room-types/${roomTypeId}/status?status=${status}`);
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
    patchRoomTypeStatus,
    deleteRoomType,
    restoreRoomType,
    getListRoomByRoomTypeId,
    createMultipleRooms,
    createMultipleRooms as addRoomsToRoomType,
    updatePhysicalRoom,
    deleteMultipleRooms,
    deleteMultipleRooms as deleteRoomsFromRoomType,
    restorePhysicalRooms,
    searchRoomTypes,
};


