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

const getTotalBookings = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/report/total-bookings`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTotalCanceled = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/report/total-canceled`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTotalNights = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/report/total-nights`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

const getTotalRevenue = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/report/total-revenue`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
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

const getYearlyRevenue = async (accommodationId) => {
    try {
        const response = await axios.get(`/bookings/host/${accommodationId}/yearly-revenue`);
        return response;
    } catch (error) {
        throw error;
    }
};

const getRevenueByRoomType = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/revenue-by-room-type`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

const getBookingStatistics = async (accommodationId, startDate, endDate) => {
    try {
        let url = `/bookings/host/${accommodationId}/statistics`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url);
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

/**
 * Lấy danh sách đơn đặt phòng của Host (Chọn cơ sở hoặc tất cả cơ sở, hỗ trợ lọc theo trạng thái)
 * GET /bookings/host?accommodationId={accommodationId}&status={status}&page={page}&size={size}
 */
const getHostBookings = async ({
    accommodationId,
    status,
    page = 0,
    size = 10
} = {}) => {
    try {
        const params = { page, size };
        if (accommodationId !== undefined && accommodationId !== null && accommodationId !== "") {
            params.accommodationId = accommodationId;
        }
        if (status) {
            params.status = status;
        }
        const response = await axios.get("/bookings/host", { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    getListBooking,
    getHostBookings,
    getBookingMonthReport,
    getTodayRevenue,
    getMonthRevenue,
    getTotalBookings,
    getTotalCanceled,
    getTotalNights,
    getTotalRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
    getRevenueByRoomType,
    getBookingStatistics,
    getTodayGuests,
    getTodayCheckins,
};