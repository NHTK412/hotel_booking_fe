import axios from "../config/axiosConfig";

const getAllProvinceNames = async () => {
    try {
        const response = await axios.get("/locations/provinces");
        return response.data;
    } catch (error) {
        throw error;
    }
}

const getDistrictsByProvinceName = async (provinceName) => {
    try {
        const response = await axios.get(`/locations/districts?provinceName=${provinceName}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export {
    getAllProvinceNames,
    getDistrictsByProvinceName
}