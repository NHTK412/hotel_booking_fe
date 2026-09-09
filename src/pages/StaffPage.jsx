import { useContext, useEffect, useState } from "react";
import StaffHeader from "../components/staff/StaffHeader";
import StaffTable from "../components/staff/StaffTable";
import AccessDeniedPage from "./AccessDeniedPage";
import { globalContext } from "../context/GlobalContext";
import { getStaffByHotel } from "../services/UserService";

const StaffPage = () => {
    const [staffPage, setStaffPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 0,
            totalPages: 0,
            totalElements: 0,
        }
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [isDeleted, setIsDeleted] = useState(false);

    const { listHotel, hotelCurrent, selectedAccommodationId, isCurrentReceptionist } = useContext(globalContext);

    const activeHotelId = selectedAccommodationId || listHotel?.[hotelCurrent]?.accommodationId || listHotel?.[0]?.accommodationId;

    useEffect(() => {
        if (!isCurrentReceptionist && activeHotelId) {
            fetchStaffByHotel(activeHotelId, currentPage, currentPageSize, isDeleted);
        }
    }, [activeHotelId, currentPage, currentPageSize, isDeleted, isCurrentReceptionist]);

    const fetchStaffByHotel = async (hotelId, page, size, isDeleted) => {
        try {
            const response = await getStaffByHotel(hotelId, page, size, isDeleted);
            setStaffPage(response.data);
        } catch (error) {
            console.error("Error fetching staff by hotel:", error);
        }
    };

    if (isCurrentReceptionist) {
        return <AccessDeniedPage />;
    }

    return (
        <>
            <StaffHeader
                currentPage={currentPage}
                currentPageSize={currentPageSize}
                isDeleted={isDeleted}
                setIsDeleted={setIsDeleted}
                fetchStaffByHotel={fetchStaffByHotel}
            ></StaffHeader>
            <StaffTable
                staffPage={staffPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentPageSize={currentPageSize}
                setCurrentPageSize={setCurrentPageSize}
                isDeleted={isDeleted}
                setIsDeleted={setIsDeleted}
                fetchStaffByHotel={fetchStaffByHotel}
            ></StaffTable>
        </>
    );
}

export default StaffPage;