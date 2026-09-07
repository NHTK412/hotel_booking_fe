import axios from "../config/AxiosConfig";

/**
 * Lấy danh sách tên tất cả các Tỉnh / Thành phố
 * API: GET /api/locations/provinces
 * @returns {Promise<string[]>} Mảng tên các tỉnh thành (e.g. ['Hà Nội', 'Hồ Chí Minh', ...])
 */
const getAllProvinceNames = async () => {
    try {
        const response = await axios.get("/locations/provinces");
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh thành:", error);
        throw error;
    }
};

/**
 * Lấy danh sách Quận / Huyện theo Tỉnh / Thành phố
 * API: GET /api/locations/districts?province={province}
 * Lưu ý: Tham số query trên Backend là "province" (KHÔNG PHẢI "provinceName")
 * @param {string} province Tên tỉnh/thành phố
 * @returns {Promise<Array<{locationId: number, provinceName: string, districtName: string, latitude: number, longitude: number, searchVector: string}>>}
 */
const getDistrictsByProvinceName = async (province) => {
    try {
        if (!province) return [];
        const response = await axios.get(`/locations/districts?province=${encodeURIComponent(province)}`);
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi lấy danh sách quận huyện theo tỉnh:", error);
        throw error;
    }
};

/**
 * Tìm kiếm địa điểm theo từ khóa
 * API: GET /api/locations/search?keyword={kw}&page={p}&size={s}
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 */
const searchLocations = async (keyword, page = 0, size = 10) => {
    try {
        const response = await axios.get(
            `/locations/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
        );
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi tìm kiếm địa điểm:", error);
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết một địa điểm theo ID
 * API: GET /api/locations/{locationId}
 * @param {number} locationId
 */
const getLocationById = async (locationId) => {
    try {
        const response = await axios.get(`/locations/${locationId}`);
        return response?.data || response;
    } catch (error) {
        console.error("Lỗi lấy chi tiết địa điểm:", error);
        throw error;
    }
};

/**
 * Lấy toàn bộ danh sách địa điểm trong CSDL
 * API: GET /api/locations/all
 */
const getAllLocations = async () => {
    try {
        const response = await axios.get("/locations/all");
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi lấy toàn bộ danh sách địa điểm:", error);
        throw error;
    }
};

/**
 * Tính toán mã GeoHash từ tọa độ Vĩ độ và Kinh độ
 * API: GET /api/locations/calculator?lat={lat}&lng={lng}
 * @param {number} lat Vĩ độ
 * @param {number} lng Kinh độ
 */
const calculateGeoHash = async (lat, lng) => {
    try {
        const response = await axios.get(`/locations/calculator?lat=${lat}&lng=${lng}`);
        return response?.data || response;
    } catch (error) {
        console.error("Lỗi tính toán mã GeoHash:", error);
        throw error;
    }
};

export {
    getAllProvinceNames,
    getDistrictsByProvinceName,
    searchLocations,
    getLocationById,
    getAllLocations,
    calculateGeoHash
};