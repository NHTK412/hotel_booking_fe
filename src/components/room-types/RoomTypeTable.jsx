import { DeleteOutlined, EditOutlined, EyeOutlined, StarFilled, StarOutlined } from "@ant-design/icons"
import { Button, Image, notification, Popconfirm, Spin, Table, Tooltip } from "antd"
import { use, useContext, useEffect, useState } from "react"
import { deleteRoomType, getListRoomTypes } from "../../services/RoomService"
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
                            <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa loại phòng này không?"
                                onConfirm={async () => {
                                    try {
                                        const response = await deleteRoomType(record.roomtypeId);
                                        notification.success({
                                            title: "Thành công",
                                            description: "Loại phòng đã được xóa thành công"
                                        });
                                        fetchRoomTypes();
                                    } catch (error) {
                                        console.error("Lỗi khi xóa loại phòng: ", error);
                                        notification.error({
                                            title: "Lỗi",
                                            description: "Có lỗi xảy ra khi xóa loại phòng"
                                        });
                                    }
                                }}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button color="danger" variant="filled">
                                    <DeleteOutlined />
                                </Button>
                            </Popconfirm>
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