import { notification } from "antd";
import BookingTable from "../components/booking/BookingTable";
import { useContext, useEffect, useState } from "react";
import { globalContext } from "../context/GlobalContext";
import { getListBooking } from "../services/BookingService";

const BookingPage = () => {

    const { listHotel, hotelCurrent } = useContext(globalContext);

    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);

    const [bookingPage, setBookingPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 0,
            totalPages: 0
        }
    });


    useEffect(() => {
        fetchBookings();
    }, [hotelCurrent, currentPage, currentPageSize]);

    const fetchBookings = async () => {
        try {
            const accommodationId = listHotel[hotelCurrent].accommodationId;

            const response = await getListBooking(accommodationId, currentPage, currentPageSize);

            setBookingPage(response.data);

            console.log(response.data);

        } catch (error) {
            console.log(error);
            notification.error({
                title: "Lỗi",
                description: "Không thể tải danh sách đặt phòng"
            })
        }
    }



    return (
        <>
            <h2 className="text-2xl font-medium mb-5">Danh sách đặt phòng</h2>
            <BookingTable
                bookingPage={bookingPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentPageSize={currentPageSize}
                setCurrentPageSize={setCurrentPageSize}
            ></BookingTable>
        </>
    );
}


export default BookingPage;