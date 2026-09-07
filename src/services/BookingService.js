import axios from "../config/AxiosConfig";

const getListBooking = async (accommodationId, page, size) => {
    try {
        const response = await axios.get(`/bookings/accommodation/${accommodationId}?page=${page}&size=${size}`)
        return response;
    } catch (error) {
        throw error;
    }
}

const getBookingMonthReport = async (accommodationId, year) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/monthly-report?year=${year}`);
        return response;
    } catch (error) {
        throw error;
    }

}



export {
    getListBooking,
    getBookingMonthReport
};