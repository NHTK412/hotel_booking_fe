import axios from "../config/AxiosConfig";

/**
 * Lấy danh sách đánh giá của loại phòng (Có phân trang và sắp xếp)
 * @param {number|string} roomTypeId - ID loại phòng
 * @param {number} page - Số trang (bắt đầu từ 0)
 * @param {number} size - Kích thước trang
 * @param {boolean} sort - Sắp xếp điểm sao
 */
export const getReviewsByRoomType = async (roomTypeId, page = 0, size = 10, sort = true) => {
    try {
        const response = await axios.get(
            `/reviews?roomType=${roomTypeId}&page=${page}&size=${size}&sort=${sort}`
        );
        return response;
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá của loại phòng ${roomTypeId}:`, error);
        throw error;
    }
};

export default {
    getReviewsByRoomType,
};
