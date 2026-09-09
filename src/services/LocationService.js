import axios from "../config/AxiosConfig";

const getAllProvinceNames = async () => {
    try {
        const response = await axios.get("/locations/provinces");
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh thành:", error);
        throw error;
    }
};


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

const getLocationById = async (locationId) => {
    try {
        const response = await axios.get(`/locations/${locationId}`);
        return response?.data || response;
    } catch (error) {
        console.error("Lỗi lấy chi tiết địa điểm:", error);
        throw error;
    }
};


const getAllLocations = async () => {
    try {
        const response = await axios.get("/locations/all");
        return response?.data || response || [];
    } catch (error) {
        console.error("Lỗi lấy toàn bộ danh sách địa điểm:", error);
        throw error;
    }
};


const calculateGeoHash = async (lat, lng) => {
    try {
        const response = await axios.get(`/locations/calculator?lat=${lat}&lng=${lng}`);
        return response?.data || response;
    } catch (error) {
        console.error("Lỗi tính toán mã GeoHash:", error);
        throw error;
    }
};

const getCurrentLocation = async ({ subAdministrativeArea, administrativeArea, latitude, longitude } = {}) => {
    try {
        const params = new URLSearchParams();
        if (subAdministrativeArea) params.append("subAdministrativeArea", subAdministrativeArea);
        if (administrativeArea) params.append("administrativeArea", administrativeArea);
        if (latitude !== undefined && latitude !== null) params.append("latitude", latitude);
        if (longitude !== undefined && longitude !== null) params.append("longitude", longitude);

        const response = await axios.get(`/locations/me?${params.toString()}`);
        return response?.data || response;
    } catch (error) {
        console.error("Lỗi xác định vị trí hiện tại:", error);
        throw error;
    }
};

export {
    getAllProvinceNames,
    getDistrictsByProvinceName,
    searchLocations,
    getLocationById,
    getAllLocations,
    calculateGeoHash,
    getCurrentLocation,
};