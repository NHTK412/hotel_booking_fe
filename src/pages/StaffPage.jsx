import { useContext, useEffect, useState } from "react";
import StaffHeader from "../components/staff/StaffHeader";
import StaffTable from "../components/staff/StaffTable"
import { globalContext } from "../context/GlobalContext";
import { getStaffByHotel } from "../services/UserService";

const StaffPage = () => {

    const [staffPage, setStaffPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 0,
            totalPages: 0
        }
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [isDeleted, setIsDeleted] = useState(false);

    const { listHotel, hotelCurrent } = useContext(globalContext);


    useEffect(() => {
        const hotelId = listHotel[hotelCurrent].accommodationId;
        fetchStaffByHotel(hotelId, currentPage, currentPageSize, isDeleted);
    }, [hotelCurrent, currentPage, currentPageSize, isDeleted]);


    const fetchStaffByHotel = async (hotelId, page, size, isDeleted) => {
        try {
            const response = await getStaffByHotel(hotelId, page, size, isDeleted);
            setStaffPage(response.data);
        } catch (error) {
            console.error("Error fetching staff by hotel:", error);
            throw error;
        }
    };

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