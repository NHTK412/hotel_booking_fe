import { useEffect, useState } from "react";
import {
    Drawer,
    Tag,
    Image,
    Spin,
    Button,
    Popconfirm,
    notification,
    Descriptions,
    Card,
    Table,
    Empty,
    Space,
    Typography,
} from "antd";
import {
    HomeOutlined,
    EnvironmentOutlined,
    LockOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    PictureOutlined,
    DollarOutlined,
    StarFilled,
} from "@ant-design/icons";
import { getAccommodationById, deleteAccommodation } from "../../services/AccommodationService";
import { ACCOMMODATION_TYPE_CONFIG } from "../../config/themeConfig";
import LeafletLocationPicker from "../common/LeafletLocationPicker";

const { Title, Text, Paragraph } = Typography;

const AccommodationDetailDrawer = ({
    open,
    onClose,
    accommodationId,
    onLockSuccess,
}) => {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    useEffect(() => {
        if (open && accommodationId) {
            fetchDetail(accommodationId);
        } else if (!open) {
            setDetail(null);
        }
    }, [open, accommodationId]);

    const fetchDetail = async (id) => {
        try {
            setIsLoading(true);
            const response = await getAccommodationById(id);
            const data = response?.data || response;
            setDetail(data);
        } catch (error) {
            console.error("Lỗi lấy chi tiết cơ sở lưu trú:", error);
            notification.error({
                message: "Không thể lấy thông tin chi tiết",
                description: error?.message || "Đã xảy ra lỗi khi kết nối tới máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLockAccommodation = async () => {
        if (!detail?.accommodationId) return;
        try {
            setIsLocking(true);
            await deleteAccommodation(detail.accommodationId);
            notification.success({
                message: "Đã khóa cơ sở lưu trú",
                description: `Cơ sở lưu trú "${detail.accommodationName}" đã được chuyển sang trạng thái ngừng hoạt động.`,
            });
            if (onLockSuccess) onLockSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khóa cơ sở lưu trú:", error);
            notification.error({
                message: "Khóa thất bại",
                description: error?.message || "Không thể thực hiện khóa cơ sở lưu trú.",
            });
        } finally {
            setIsLocking(false);
        }
    };

    const typeConfig = detail?.type ? ACCOMMODATION_TYPE_CONFIG[detail.type] : null;

    const roomTypeColumns = [
        {
            title: "Ảnh",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (img) => (
                <div className="w-14 h-11 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {img ? (
                        <Image
                            src={img}
                            alt="Room"
                            className="w-full h-full object-cover"
                            fallback="https://placehold.co/80x60?text=No+Image"
                        />
                    ) : (
                        <PictureOutlined className="text-slate-400" />
                    )}
                </div>
            ),
        },
        {
            title: "Loại phòng",
            dataIndex: "name",
            key: "name",
            render: (name, record) => (
                <div>
                    <div className="font-semibold text-slate-800">{name}</div>
                    {record.star > 0 && (
                        <div className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                            <StarFilled /> {record.star.toFixed(1)} sao
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Giá niêm yết",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (price) => (
                <span className="font-medium text-slate-700">
                    {price ? `${Number(price).toLocaleString("vi-VN")} ₫` : "Chưa cập nhật"}
                </span>
            ),
        },
        {
            title: "Chiết khấu",
            dataIndex: "discount",
            key: "discount",
            align: "center",
            width: 95,
            render: (discount) =>
                discount && Number(discount) > 0 ? (
                    <Tag color="red" className="font-bold text-xs m-0">
                        -{discount}%
                    </Tag>
                ) : (
                    <span className="text-xs text-slate-400">0%</span>
                ),
        },
    ];

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <HomeOutlined className="text-blue-600" />
                    <span>Chi Tiết & Kiểm Soát Hoạt Động Cơ Sở Lưu Trú</span>
                </div>
            }
            open={open}
            onClose={onClose}
            width={780}
            destroyOnClose
            extra={
                detail && (
                    <Popconfirm
                        title="Khóa cơ sở lưu trú này?"
                        description={`Hành động này sẽ khóa và ngừng hiển thị "${detail.accommodationName}" trên toàn hệ thống.`}
                        onConfirm={handleLockAccommodation}
                        okText="Khóa ngay"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: isLocking }}
                    >
                        <Button danger icon={<LockOutlined />} loading={isLocking} size="middle">
                            Khóa Cơ Sở Lưu Trú
                        </Button>
                    </Popconfirm>
                )
            }
        >
            <Spin spinning={isLoading}>
                {detail ? (
                    <div className="space-y-6">
                        {/* Hero Banner & Image */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm h-64">
                            {detail.image ? (
                                <Image
                                    src={detail.image}
                                    alt={detail.accommodationName}
                                    className="w-full h-full object-cover"
                                    preview={{ mask: "Phóng to ảnh" }}
                                    fallback="https://placehold.co/800x400?text=No+Preview"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <PictureOutlined className="text-5xl mb-2" />
                                    <span>Chưa cập nhật hình ảnh đại diện</span>
                                </div>
                            )}

                            {/* Badge Overlay */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
                                <Tag
                                    color={typeConfig?.tagColor || "blue"}
                                    className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm"
                                >
                                    {typeConfig?.label || detail.type}
                                </Tag>
                                {detail.starRating > 0 && (
                                    <Tag color="gold" className="px-2 py-0.5 text-xs font-semibold shadow-sm inline-flex items-center gap-1">
                                        <StarFilled /> {detail.starRating} Sao
                                    </Tag>
                                )}
                            </div>
                        </div>

                        {/* Title & General Info */}
                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <Title level={4} className="mb-0 text-slate-800">
                                    {detail.accommodationName}
                                </Title>
                                <Tag color="green" className="text-xs px-2 py-0.5 m-0 font-medium">
                                    ● Đang hoạt động
                                </Tag>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                                <EnvironmentOutlined className="text-blue-500" />
                                <span>
                                    {detail.address}
                                    {detail.city ? `, ${detail.city}` : ""}
                                </span>
                            </div>
                        </div>

                        {/* Descriptions Data */}
                        <Descriptions
                            bordered
                            size="small"
                            column={{ xs: 1, sm: 2, md: 3 }}
                            className="bg-slate-50/50 rounded-xl overflow-hidden"
                        >
                            <Descriptions.Item label="Mã ID Khách Sạn">
                                <span className="font-mono font-semibold text-blue-600">
                                    #{detail.accommodationId}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã Location ID">
                                <span className="font-mono text-slate-700">
                                    #{detail.locationId || "Chưa gán"}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại Hình">
                                <Tag color="blue" className="m-0 text-xs">
                                    {typeConfig?.label || detail.type}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tỉnh / Thành Phố">
                                {detail.city || "Chưa cập nhật"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa Chỉ Cụ Thể" span={2}>
                                {detail.address || "Chưa cập nhật"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tọa Độ GPS" span={3}>
                                {detail.latitude && detail.longitude ? (
                                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 inline-flex items-center gap-1.5">
                                        <EnvironmentOutlined />
                                        Vĩ độ: {Number(detail.latitude).toFixed(6)} | Kinh độ:{" "}
                                        {Number(detail.longitude).toFixed(6)}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 italic">Chưa ghim tọa độ</span>
                                )}
                            </Descriptions.Item>
                            {detail.description && (
                                <Descriptions.Item label="Giới Thiệu" span={3}>
                                    <Paragraph
                                        ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                                        className="mb-0 text-slate-600 text-xs leading-relaxed"
                                    >
                                        {detail.description}
                                    </Paragraph>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {/* Interactive Leaflet Map Display */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
                                    <EnvironmentOutlined className="text-blue-600" />
                                    Vị Trí Định Vị Bản Đồ (Geocoding)
                                </div>
                                <span className="text-xs text-slate-400">
                                    Tọa độ thực tế khách sạn trên sàn
                                </span>
                            </div>

                            <LeafletLocationPicker
                                latitude={detail.latitude || 10.7769}
                                longitude={detail.longitude || 106.7009}
                                height="280px"
                                label={detail.accommodationName}
                            />
                        </div>

                        {/* Room Types Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
                                    <AppstoreOutlined className="text-blue-600" />
                                    Danh Sách Loại Phòng ({detail.roomTypes?.length || 0})
                                </div>
                                <span className="text-xs text-slate-400">
                                    Các loại phòng đang mở bán
                                </span>
                            </div>

                            <Table
                                rowKey="roomtypeId"
                                size="small"
                                columns={roomTypeColumns}
                                dataSource={detail.roomTypes || []}
                                pagination={false}
                                locale={{
                                    emptyText: (
                                        <div className="py-4 text-slate-400 text-xs">
                                            Cơ sở lưu trú này hiện chưa khởi tạo loại phòng nào.
                                        </div>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <Empty
                            description="Không tìm thấy thông tin cơ sở lưu trú."
                            className="py-12"
                        />
                    )
                )}
            </Spin>
        </Drawer>
    );
};

export default AccommodationDetailDrawer;
