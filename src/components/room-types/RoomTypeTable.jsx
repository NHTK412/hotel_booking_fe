import { useState, useContext } from "react";
import {
    Table,
    Button,
    Image,
    Tag,
    Tooltip,
    Popconfirm,
    notification,
    Modal,
    InputNumber,
    Space,
    Typography,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    StarFilled,
    UserOutlined,
    HomeOutlined,
    DollarOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import { deleteRoomType, patchRoomTypePrice, restoreRoomType, patchRoomTypeStatus } from "../../services/RoomService";
import { globalContext } from "../../context/GlobalContext";
import RoomTypeDetail from "./RoomTypeDetail";

const { Text } = Typography;

const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);
};

const AMENITY_MAP = {
    WIFI: { label: "WiFi", color: "blue" },
    AIR_CONDITIONING: { label: "Điều hòa", color: "cyan" },
    TV: { label: "TV", color: "purple" },
    MINI_BAR: { label: "Mini bar", color: "orange" },
    ROOM_SERVICE: { label: "Dịch vụ phòng", color: "geekblue" },
    SWIMMING_POOL: { label: "Hồ bơi", color: "blue" },
    GYM: { label: "Phòng gym", color: "volcano" },
    SPA: { label: "Spa", color: "magenta" },
    PARKING: { label: "Bãi đỗ xe", color: "green" },
    BREAKFAST_INCLUDED: { label: "Bao gồm ăn sáng", color: "gold" },
};

const RoomTypeTable = ({
    roomTypesPage,
    setRoomTypesPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize,
    isLoadingRoomTypes,
    setIsLoadingRoomTypes,
    fetchRoomTypes,
    isDeletedView = false,
}) => {
    const { listHotel, hotelCurrent, isCurrentManager, activeRole } = useContext(globalContext);
    const isManager = activeRole === "ROLE_MANAGER";

    const [isShowRoomTypeDetail, setIsShowRoomTypeDetail] = useState(false);
    const [roomTypeSelected, setRoomTypeSelected] = useState(null);

    // Quick edit price state
    const [quickEditItem, setQuickEditItem] = useState(null);
    const [newPrice, setNewPrice] = useState(0);
    const [newDiscount, setNewDiscount] = useState(0);
    const [isSavingPrice, setIsSavingPrice] = useState(false);

    const handleOpenQuickEdit = (record) => {
        setQuickEditItem(record);
        setNewPrice(Number(record.price) || 0);
        setNewDiscount(Number(record.discount) || 0);
    };

    const handleSaveQuickPrice = async () => {
        if (!quickEditItem) return;
        if (newPrice <= 0) {
            notification.warning({
                message: "Giá phòng không hợp lệ",
                description: "Giá niêm yết phải lớn hơn 0 VNĐ.",
            });
            return;
        }
        if (newDiscount < 0 || newDiscount > 100) {
            notification.warning({
                message: "Giảm giá không hợp lệ",
                description: "Tỷ lệ giảm giá phải từ 0% đến 100%.",
            });
            return;
        }

        try {
            setIsSavingPrice(true);
            await patchRoomTypePrice(quickEditItem.roomtypeId, newPrice, newDiscount);
            notification.success({
                message: "Cập nhật giá thành công",
                description: `Đã cập nhật giá mới cho loại phòng "${quickEditItem.name}".`,
            });
            setQuickEditItem(null);
            fetchRoomTypes();
        } catch (error) {
            console.error("Lỗi cập nhật nhanh giá:", error);
            notification.error({
                message: "Cập nhật giá thất bại",
                description: error?.response?.data?.message || error?.message || "Không thể cập nhật giá phòng.",
            });
        } finally {
            setIsSavingPrice(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteRoomType(record.roomtypeId);
            notification.success({
                message: "Xóa thành công",
                description: `Đã chuyển loại phòng "${record.name}" vào thùng rác.`,
            });
            fetchRoomTypes();
        } catch (error) {
            console.error("Lỗi khi xóa loại phòng:", error);
            notification.error({
                message: "Không thể xóa loại phòng",
                description: error?.response?.data?.message || error?.message || "Loại phòng có thể đang có đơn đặt hoặc phòng liên quan.",
            });
        }
    };

    const handleRestore = async (record) => {
        try {
            setIsLoadingRoomTypes(true);
            await restoreRoomType(record.roomtypeId);
            notification.success({
                message: "Khôi phục thành công",
                description: `Đã khôi phục loại phòng "${record.name}" trở lại hoạt động.`,
            });
            fetchRoomTypes();
        } catch (error) {
            console.error("Lỗi khi khôi phục loại phòng:", error);
            notification.error({
                message: "Khôi phục thất bại",
                description: error?.response?.data?.message || error?.message || "Không thể khôi phục loại phòng.",
            });
        } finally {
            setIsLoadingRoomTypes(false);
        }
    };

    const handleToggleRoomTypeStatus = async (record) => {
        const nextStatus = record.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
        try {
            setIsLoadingRoomTypes(true);
            await patchRoomTypeStatus(record.roomtypeId, nextStatus);
            notification.success({
                message: "Thành công",
                description:
                    nextStatus === "INACTIVE"
                        ? `Đã chuyển loại phòng "${record.name}" sang tạm ngưng nhận khách.`
                        : `Đã mở nhận khách trở lại cho loại phòng "${record.name}".`,
            });
            fetchRoomTypes();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái loại phòng:", error);
            notification.error({
                message: "Cập nhật trạng thái thất bại",
                description: error?.response?.data?.message || "Không thể cập nhật trạng thái loại phòng.",
            });
        } finally {
            setIsLoadingRoomTypes(false);
        }
    };



    const columns = [
        {
            title: "Mã",
            dataIndex: "roomtypeId",
            key: "roomtypeId",
            width: 75,
            align: "center",
            render: (id) => (
                <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                    #{id}
                </span>
            ),
        },
        {
            title: "Ảnh",
            dataIndex: "image",
            key: "image",
            width: 90,
            align: "center",
            render: (img) => (
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center mx-auto shadow-xs">
                    {img ? (
                        <Image
                            src={img}
                            alt="Room Cover"
                            width={64}
                            height={48}
                            className="w-full h-full object-cover rounded-lg"
                            fallback="https://placehold.co/100x80?text=No+Image"
                        />
                    ) : (
                        <PictureOutlined className="text-slate-400 text-lg" />
                    )}
                </div>
            ),
        },
        {
            title: "Tên loại phòng",
            dataIndex: "name",
            key: "name",
            width: 220,
            render: (name, record) => (
                <div className="flex flex-col gap-1">
                    <span
                        className="font-bold text-slate-800 transition-colors cursor-pointer text-sm line-clamp-1 hover:text-blue-600"
                        onClick={() => {
                            setRoomTypeSelected(record);
                            setIsShowRoomTypeDetail(true);
                        }}
                    >
                        {name}
                    </span>
                    {(isDeletedView || record.isDeleted) && (
                        <Tag color="error" className="w-fit text-xs scale-90 -ml-1">
                            Đã xóa
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: "Đơn vị lưu trú",
            dataIndex: "accommodationName",
            key: "accommodationName",
            width: 150,
            render: (name, record) => (
                <>
                    {name}
                </>
            ),
        },
        {
            title: "Số khách",
            dataIndex: "capacity",
            key: "capacity",
            width: 100,
            align: "center",
            render: (capacity) => (
                <span>
                    {Number(capacity || 2)}
                </span>
            ),
        },
        {
            title: "Số phòng ngủ",
            dataIndex: "bedroom",
            key: "bedroom",
            width: 130,
            align: "center",
            render: (bedroom) => (
                <span>
                    {Number(bedroom || 1)}
                </span>
            ),
        },
        {
            title: "Đánh giá",
            dataIndex: "star",
            key: "star",
            width: 95,
            align: "center",
            render: (star) => (
                <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold text-amber-700">
                    <span>{Number(star || 5.0).toFixed(1)}</span>
                    <StarFilled className="text-amber-400 text-xs" />
                </div>
            ),
        },
        {
            title: "Giá niêm yết",
            dataIndex: "price",
            key: "price",
            width: 140,
            render: (price) => (
                <span className="font-semibold text-slate-700 text-xs">
                    {formatVND(price)}
                </span>
            ),
        },
        {
            title: "Giảm giá",
            dataIndex: "discount",
            key: "discount",
            width: 110,
            align: "center",
            render: (discount) => {
                const discVal = Number(discount) || 0;
                return discVal > 0 ? (
                    <Tag color="error" className="font-semibold text-xs m-0">
                        -{discVal}%
                    </Tag>
                ) : (
                    <span className="text-slate-400 text-xs">—</span>
                );
            },
        },
        {
            title: "Giá thực nhận",
            key: "finalPrice",
            width: 145,
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const discount = Number(record.discount) || 0;
                const finalPrice = Math.max(0, Math.round(price * (1 - discount / 100)));
                return (
                    <span className="font-bold text-emerald-600 text-sm">
                        {formatVND(finalPrice)}
                    </span>
                );
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: isDeletedView ? 160 : 130,
            align: "center",
            fixed: "right",
            render: (_, record) => {
                const isDeleted = isDeletedView || record.isDeleted;

                if (isDeleted) {
                    return (
                        <Space size="small">
                            {isManager && (
                                <Tooltip title="Khôi phục loại phòng này">
                                    <Popconfirm
                                        title="Khôi phục loại phòng?"
                                        description={`Bạn có chắc muốn khôi phục lại "${record.name}" không? Loại phòng sẽ hiển thị hoạt động trở lại.`}
                                        onConfirm={() => handleRestore(record)}
                                        okText="Khôi phục"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<RollbackOutlined />}
                                            className="bg-emerald-600 hover:bg-emerald-700 flex items-center text-xs"
                                        >
                                            Khôi phục
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
                            )}

                            <Tooltip title="Xem chi tiết & Quản lý phòng vật lý">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined className="text-blue-600 text-base" />}
                                    onClick={() => {
                                        setRoomTypeSelected(record);
                                        setIsShowRoomTypeDetail(true);
                                    }}
                                />
                            </Tooltip>
                        </Space>
                    );
                }

                return (
                    <Space size="small">
                        {
                            isManager && (
                                <Tooltip title="Cập nhật nhanh giá">
                                    <Button
                                        type="text"
                                        icon={<DollarOutlined className="text-emerald-600 text-base" />}
                                        onClick={() => handleOpenQuickEdit(record)}
                                    />
                                </Tooltip>
                            )
                        }

                        <Tooltip title="Xem chi tiết & Quản lý phòng vật lý">
                            <Button
                                type="text"
                                icon={<EyeOutlined className="text-blue-600 text-base" />}
                                onClick={() => {
                                    setRoomTypeSelected(record);
                                    setIsShowRoomTypeDetail(true);
                                }}
                            />
                        </Tooltip>

                        {isManager && (
                            <Tooltip title="Xóa loại phòng">
                                <Popconfirm
                                    title="Xác nhận xóa loại phòng"
                                    description={`Bạn có chắc chắn muốn chuyển "${record.name}" vào thùng rác không?`}
                                    onConfirm={() => handleDelete(record)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button type="text" danger icon={<DeleteOutlined className="text-base" />} />
                                </Popconfirm>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
    ];

    const content = roomTypesPage?.content || [];
    const pageNumber = Number(roomTypesPage?.page?.number ?? currentPage);
    const pageSize = Number(roomTypesPage?.page?.size ?? currentPageSize);
    const totalItems = Number(roomTypesPage?.page?.totalElements ?? roomTypesPage?.page?.totalPages ?? content.length);

    return (
        <>
            <Table
                dataSource={content}
                columns={columns}
                rowKey="roomtypeId"
                loading={isLoadingRoomTypes}
                scroll={{ x: 1180 }}
                pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    current: pageNumber + 1,
                    pageSize: pageSize,
                    total: totalItems,
                    onChange: (page, pSize) => {
                        setCurrentPage(page - 1);
                        setCurrentPageSize(pSize);
                    },
                    showTotal: (total) => `Đang hiển thị ${content.length} loại phòng`,
                }}
            />

            {/* Modal Chi tiết loại phòng & quản lý phòng vật lý */}
            <RoomTypeDetail
                isShow={isShowRoomTypeDetail}
                setIsShow={setIsShowRoomTypeDetail}
                roomTypeSelected={roomTypeSelected}
                onUpdate={fetchRoomTypes}
            />

            {/* Modal Cập Nhật Nhanh Giá Phòng */}
            <Modal
                title={
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <DollarOutlined className="text-emerald-600 text-lg" />
                        <div>
                            <span className="text-base font-bold text-slate-800">
                                Cập Nhật Nhanh Giá Phòng
                            </span>
                            <p className="text-xs text-slate-500 m-0">
                                {quickEditItem?.name} (#{quickEditItem?.roomtypeId})
                            </p>
                        </div>
                    </div>
                }
                open={!!quickEditItem}
                onCancel={() => setQuickEditItem(null)}
                onOk={handleSaveQuickPrice}
                confirmLoading={isSavingPrice}
                okText="Lưu Thay Đổi"
                cancelText="Hủy"
                destroyOnClose
            >
                <div className="space-y-4 py-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Giá Niêm Yết Gốc (VNĐ):
                        </label>
                        <InputNumber
                            value={newPrice}
                            onChange={(val) => setNewPrice(Number(val) || 0)}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                            step={50000}
                            style={{ width: "100%" }}
                            size="large"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Tỷ Lệ Giảm Giá (%):
                        </label>
                        <InputNumber
                            value={newDiscount}
                            onChange={(val) => setNewDiscount(Number(val) || 0)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            style={{ width: "100%" }}
                            size="large"
                        />
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-800">
                            Giá Thực Nhận (Sau giảm):
                        </span>
                        <span className="text-lg font-bold text-emerald-700">
                            {formatVND(Math.max(0, Math.round(newPrice * (1 - (newDiscount || 0) / 100))))}
                        </span>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default RoomTypeTable;