import axios from "../config/AxiosConfig";

// Lấy danh sách khách sạn có phân trang và lọc theo loại/địa điểm
const getAllAccommodations = async ({
    page = 0,
    size = 10,
    type,
    locationId,
    sortBy
} = {}) => {
    let url = `/accommodations?page=${page}&size=${size}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    if (locationId) url += `&locationId=${locationId}`;
    if (sortBy !== undefined) url += `&sortBy=${sortBy}`;

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

// Cập nhật thông tin cơ sở lưu trú (Admin và Host)
const updateAccommodation = async (id, data) => {
    return await axios.put(`/accommodations/${id}`, data);
};

// Xóa cơ sở lưu trú (Admin và Host)
const deleteAccommodation = async (id) => {
    return await axios.delete(`/accommodations/${id}`);
};

// Tìm kiếm khách sạn theo từ khóa
const searchAccommodations = async ({ keyword, page = 0, size = 10 }) => {
    return await axios.get(
        `/accommodations/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
};

export {
    getAllAccommodations,
    getAccommodationById,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    searchAccommodations
};
