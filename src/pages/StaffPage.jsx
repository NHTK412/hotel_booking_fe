import { useContext, useEffect, useState } from "react";
import StaffHeader from "../components/staff/StaffHeader";
import StaffTable from "../components/staff/StaffTable"
import { globalContext } from "../context/GlobalContext";
import { getStaffByHotel } from "../services/userService";

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

    const { listHotel, hotelCurrent } = useContext(globalContext);

    useEffect(() => {
        const hotelId = listHotel[hotelCurrent].accommodationId;
        fetchStaffByHotel(hotelId, currentPage, currentPageSize);
    }, [hotelCurrent, currentPage, currentPageSize]);


    const fetchStaffByHotel = async (hotelId, page, size) => {
        try {
            const response = await getStaffByHotel(hotelId, page, size);
            setStaffPage(response.data);
        } catch (error) {
            console.error("Error fetching staff by hotel:", error);
            throw error;
        }
    };

    return (
        <>
            <StaffHeader></StaffHeader>
            <StaffTable
                staffPage={staffPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentPageSize={currentPageSize}
                setCurrentPageSize={setCurrentPageSize}
            ></StaffTable>
        </>
    );
}

export default StaffPage;