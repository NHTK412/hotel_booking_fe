import { Button, notification } from "antd";
import RoomTypeTable from "../components/room-types/RoomTypeTable";
import { useContext, useEffect, useState } from "react";
import { globalContext } from "../context/GlobalContext";
import { getListRoomTypes } from "../services/RoomService";
import HeaderListRoom from "../components/room-types/HeaderListRoom";

const ListRoomTypePage = () => {

    const [roomTypesPage, setRoomTypesPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 0,
            totalPages: 0
        }
    });
    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);

    const { hotelCurrent, listHotel } = useContext(globalContext);


    useEffect(() => {
        fetchRoomTypes();
    }, [currentPage, currentPageSize, hotelCurrent]);

    const fetchRoomTypes = async () => {
        try {
            setIsLoadingRoomTypes(true);
            const response = await getListRoomTypes({
                accommodationId: listHotel[hotelCurrent].accommodationId,
                page: currentPage,
                size: currentPageSize
            });
            setRoomTypesPage(response.data);
        }
        catch (error) {
            notification.error({
                title: "Lỗi",
                description: "Không thể tải danh sách loại phòng"
            })
        }
        finally {
            setIsLoadingRoomTypes(false);
        }
    }


    return (
        <>
            <HeaderListRoom></HeaderListRoom>
            <RoomTypeTable
                roomTypesPage={roomTypesPage}
                setRoomTypesPage={setRoomTypesPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentPageSize={currentPageSize}
                setCurrentPageSize={setCurrentPageSize}
                isLoadingRoomTypes={isLoadingRoomTypes}
                setIsLoadingRoomTypes={setIsLoadingRoomTypes}
                fetchRoomTypes={fetchRoomTypes}
            />
        </>);
}

export default ListRoomTypePage;