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
};

const getTodayRevenue = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/today-revenue`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getMonthRevenue = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/month-revenue`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTotalBookings = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/report/total-bookings`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getMonthlyRevenue = async (accommodationId, year) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/monthly-revenue?year=${year}`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTodayGuests = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/today-guests`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTodayCheckins = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/today-checkins`);
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getListBooking,
    getBookingMonthReport,
    getTodayRevenue,
    getMonthRevenue,
    getTotalBookings,
    getMonthlyRevenue,
    getTodayGuests,
    getTodayCheckins,
};