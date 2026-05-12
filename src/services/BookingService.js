import axios from "../config/axiosConfig";

const getListBooking = async (accommodationId, page, size) => {
    try {
        const response = await axios.get(`/bookings/accommodation/${accommodationId}?page=${page}&size=${size}`)
        return response;
    } catch (error) {
        throw error;
    }
}



export {
    getListBooking
};