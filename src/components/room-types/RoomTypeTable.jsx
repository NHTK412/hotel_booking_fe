import { DeleteOutlined, EditOutlined, EyeOutlined, StarFilled, StarOutlined } from "@ant-design/icons"
import { Button, Image, notification, Spin, Table, Tooltip } from "antd"
import { use, useContext, useEffect, useState } from "react"
import { getListRoomTypes } from "../../services/RoomService"
import { globalContext } from "../../context/GlobalContext"
import RoomTypeDetail from "./RoomTypeDetail"

const RoomTypeTable = ({ roomTypesPage, setRoomTypesPage, currentPage, setCurrentPage, currentPageSize, setCurrentPageSize, isLoadingRoomTypes, setIsLoadingRoomTypes, fetchRoomTypes }) => {
    const columns = [
        {
            title: "Mã loại phòng",
            dataIndex: "roomtypeId",
            key: "roomtypeId"
        },
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


    const [isShowRoomTypeDetail, setIsShowRoomTypeDetail] = useState(false);
    const [roomTypeSelected, setRoomTypeSelected] = useState(null);

    return (
        <>
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
                    onUpdate={fetchRoomTypes}
                >
                </RoomTypeDetail>
            </Spin >
        </>
    );
}

export default RoomTypeTable;