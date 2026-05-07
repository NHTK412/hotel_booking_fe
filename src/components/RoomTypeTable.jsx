import { DeleteOutlined, EditOutlined, EyeOutlined, StarFilled, StarOutlined } from "@ant-design/icons"
import { Button, Image, notification, Spin, Table, Tooltip } from "antd"
import { use, useContext, useEffect, useState } from "react"
import { getListRoomTypes } from "../services/RoomService"
import { globalContext } from "../context/GlobalContext"
import RoomTypeDetail from "./RoomTypeDetail"

const RoomTypeTable = () => {



    const columns = [
        {
            title: "Mã loại phòng",
            dataIndex: "roomtypeId",
            key: "roomtypeId"
        },
        // {
        //     title: "Hình ảnh",
        //     dataIndex: "image",
        //     key: "image",
        //     render: (_, record) => {
        //         return (
        //             <Image src={record.image} alt={record.name} width={200} height={150} style={{ objectFit: "cover" }}>
        //             </Image>
        //         )
        //     }
        // },
        {
            title: "Tên loại phòng",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Số sao",
            dataIndex: "star",
            key: "star",
            render: (star) => {
                return (
                    <div>
                        <span className="mr-2">{star}</span>
                        <StarFilled style={{ color: "#fadb14" }} />
                    </div>
                )
            }
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price) => `${price.toLocaleString()} VND`

        },
        {
            title: "Giảm giá",
            dataIndex: "discount",
            key: "discount",
            render: (discount) => `${discount}%`

        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                return (
                    <div className="flex gap-2">
                        <Tooltip title="Xem chi tiết">
                            <Button color="default" variant="filled" onClick={() => {
                                setRoomTypeSelected(record);
                                setIsShowRoomTypeDetail(true);
                            }}>
                                <EyeOutlined />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <Button color="danger" variant="filled">
                                <DeleteOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                )
            }
        }
    ]


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
    const [isShowRoomTypeDetail, setIsShowRoomTypeDetail] = useState(false);
    const [roomTypeSelected, setRoomTypeSelected] = useState(null);
    const { hotelCurrent, listHotel } = useContext(globalContext);

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchRoomTypes();
    }, [currentPage, currentPageSize, hotelCurrent, isUpdating]);

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
            <h2 className="text-2xl font-medium mb-5">Danh sách loại phòng</h2>
            <Spin spinning={isLoadingRoomTypes}>
                <Table
                    dataSource={roomTypesPage.content}
                    columns={columns}
                    rowKey="roomtypeId"
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['1', '5', '10', '20', '50'],
                        current: roomTypesPage.page.number + 1,
                        pageSize: roomTypesPage.page.size,
                        total: roomTypesPage.page.totalPages,
                        onChange: (page, pageSize) => {
                            setCurrentPage(page - 1);
                            setCurrentPageSize(pageSize);
                        }
                    }}
                />
                <RoomTypeDetail
                    isShow={isShowRoomTypeDetail}
                    setIsShow={setIsShowRoomTypeDetail}
                    roomTypeSelected={roomTypeSelected}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onUpdate={fetchRoomTypes}
                    >
                </RoomTypeDetail>
            </Spin >
        </>
    );
}

export default RoomTypeTable;