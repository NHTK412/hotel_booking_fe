import axios from "../config/AxiosConfig";

// Lấy danh sách khách sạn có phân trang và lọc theo loại/địa điểm
const getAllAccommodations = async ({
    page = 0,
    size = 10,
    type,
    locationId,
    sortBy,
    includeDeleted = true,
} = {}) => {
    let url = `/accommodations?page=${page}&size=${size}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    if (locationId) url += `&locationId=${locationId}`;
    if (sortBy !== undefined) url += `&sortBy=${sortBy}`;
    if (includeDeleted !== undefined) url += `&includeDeleted=${includeDeleted}`;

    return await axios.get(url);
};

// Xem chi tiết khách sạn theo ID
const getAccommodationById = async (id) => {
    return await axios.get(`/accommodations/${id}`);
};

// Tạo mới cơ sở lưu trú (Chỉ Admin)
const createAccommodation = async (data) => {
    return await axios.post("/accommodations", data);
};

// Cập nhật thông tin cơ sở lưu trú (Chỉ Host)
const updateAccommodation = async (id, data) => {
    return await axios.put(`/accommodations/${id}`, data);
};

// Khóa cơ sở lưu trú (Xóa mềm - Chỉ Admin)
const deleteAccommodation = async (id) => {
    return await axios.delete(`/accommodations/${id}`);
};

const lockAccommodation = deleteAccommodation;

// Mở khóa / Khôi phục cơ sở lưu trú (Chỉ Admin)
const restoreAccommodation = async (id) => {
    return await axios.patch(`/accommodations/${id}/restore`);
};

// Tìm kiếm khách sạn theo từ khóa
const searchAccommodations = async ({ keyword, page = 0, size = 10 }) => {
    return await axios.get(
        `/accommodations/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
};

// Lấy danh sách các cơ sở lưu trú của Host đang đăng nhập
const getMyAccommodations = async () => {
    return await axios.get("/accommodations/my");
};

export {
    getAllAccommodations,
    getAccommodationById,
    getMyAccommodations,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    lockAccommodation,
    restoreAccommodation,
    searchAccommodations,
};
