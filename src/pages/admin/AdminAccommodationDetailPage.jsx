import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Button,
    Tag,
    Image,
    Spin,
    Typography,
    Descriptions,
    Table,
    Tabs,
    Statistic,
    Rate,
    Popconfirm,
    notification,
    Breadcrumb,
    Empty,
    Avatar,
    List,
    Space,
    Select,
} from "antd";
import {
    ArrowLeftOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    LockOutlined,
    UnlockOutlined,
    ReloadOutlined,
    DollarCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    StarOutlined,
    StarFilled,
    AppstoreOutlined,
    MessageOutlined,
    RiseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import {
    getAccommodationById,
    deleteAccommodation,
    restoreAccommodation,
} from "../../services/AccommodationService";
import {
    getListBooking,
    getTodayRevenue,
    getMonthRevenue,
    getTotalBookings,
    getMonthlyRevenue,
    getTodayGuests,
    getTodayCheckins,
} from "../../services/BookingService";
import { getReviewsByRoomType } from "../../services/ReviewService";
import { ACCOMMODATION_TYPE_CONFIG, getAccommodationTypeConfig } from "../../config/themeConfig";
import LeafletLocationPicker from "../../components/common/LeafletLocationPicker";

const { Title, Text, Paragraph } = Typography;

const AdminAccommodationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data States
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocking, setIsLocking] = useState(false);

    // KPI & Revenue States
    const [todayRev, setTodayRev] = useState(0);
    const [monthRev, setMonthRev] = useState(0);
    const [totalBookingsCount, setTotalBookingsCount] = useState(0);
    const [todayGuestsCount, setTodayGuestsCount] = useState(0);
    const [todayCheckinsCount, setTodayCheckinsCount] = useState(0);
    const [monthlyRevenueList, setMonthlyRevenueList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Bookings State
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingPageSize, setBookingPageSize] = useState(10);
    const [totalBookings, setTotalBookings] = useState(0);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);

    const loadAccommodationDetail = useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const res = await getAccommodationById(id);
            const data = res?.data || res;
            setDetail(data);

            if (data?.rooms && data.rooms.length > 0) {
                setSelectedRoomTypeId(data.rooms[0].roomTypeId || data.rooms[0].id);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin cơ sở lưu trú:", error);
            notification.error({
                message: "Không tìm thấy cơ sở lưu trú",
                description: error?.message || "Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const loadKpisAndRevenue = useCallback(async () => {
        if (!id) return;
        try {
            const [tRevRes, mRevRes, totBookRes, tGuestRes, tCheckinRes, mRevListRes] =
                await Promise.allSettled([
                    getTodayRevenue(id),
                    getMonthRevenue(id),
                    getTotalBookings(id),
                    getTodayGuests(id),
                    getTodayCheckins(id),
                    getMonthlyRevenue(id, selectedYear),
                ]);

            if (tRevRes.status === "fulfilled") {
                const val = tRevRes.value?.data ?? tRevRes.value;
                setTodayRev(typeof val === "number" ? val : Number(val) || 0);
            }
            if (mRevRes.status === "fulfilled") {
                const val = mRevRes.value?.data ?? mRevRes.value;
                setMonthRev(typeof val === "number" ? val : Number(val) || 0);
            }
            if (totBookRes.status === "fulfilled") {
                const val = totBookRes.value?.data ?? totBookRes.value;
                setTotalBookingsCount(typeof val === "number" ? val : Number(val) || 0);
            }
            if (tGuestRes.status === "fulfilled") {
                const val = tGuestRes.value?.data ?? tGuestRes.value;
                setTodayGuestsCount(typeof val === "number" ? val : Number(val) || 0);
            }
            if (tCheckinRes.status === "fulfilled") {
                const val = tCheckinRes.value?.data ?? tCheckinRes.value;
                setTodayCheckinsCount(typeof val === "number" ? val : Number(val) || 0);
            }
            if (mRevListRes.status === "fulfilled") {
                const val = mRevListRes.value?.data ?? mRevListRes.value;
                setMonthlyRevenueList(Array.isArray(val) ? val : []);
            }
        } catch (error) {
            console.warn("Lỗi tải KPI doanh thu:", error);
        }
    }, [id, selectedYear]);

    const loadBookings = useCallback(
        async (page = 1, size = 10) => {
            if (!id) return;
            try {
                setIsLoadingBookings(true);
                const res = await getListBooking(id, page - 1, size);
                const data = res?.data || res;
                if (Array.isArray(data)) {
                    setBookings(data);
                    setTotalBookings(data.length);
                } else if (data?.content && Array.isArray(data.content)) {
                    setBookings(data.content);
                    setTotalBookings(data.totalElements || data.content.length);
                } else {
                    setBookings([]);
                    setTotalBookings(0);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách đơn đặt phòng:", error);
            } finally {
                setIsLoadingBookings(false);
            }
        },
        [id]
    );

    const loadReviews = useCallback(async (roomTypeId) => {
        if (!roomTypeId) return;
        try {
            setIsLoadingReviews(true);
            const res = await getReviewsByRoomType(roomTypeId, 0, 20, true);
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setReviews(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setReviews(data.content);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error("Lỗi lấy đánh giá:", error);
            setReviews([]);
        } finally {
            setIsLoadingReviews(false);
        }
    }, []);

    useEffect(() => {
        loadAccommodationDetail();
        loadKpisAndRevenue();
        loadBookings(bookingPage, bookingPageSize);
    }, [loadAccommodationDetail, loadKpisAndRevenue, loadBookings, bookingPage, bookingPageSize]);

    useEffect(() => {
        if (selectedRoomTypeId) {
            loadReviews(selectedRoomTypeId);
        }
    }, [selectedRoomTypeId, loadReviews]);

    const handleLockAccommodation = async () => {
        if (!detail?.accommodationId) return;
        try {
            setIsLocking(true);
            await deleteAccommodation(detail.accommodationId);
            notification.success({
                message: "Đã khóa cơ sở lưu trú",
                description: `Cơ sở lưu trú "${detail.accommodationName}" đã được chuyển sang trạng thái ngừng hoạt động.`,
            });
            loadAccommodationDetail();
        } catch (error) {
            console.error("Lỗi khóa cơ sở lưu trú:", error);
            notification.error({
                message: "Khóa thất bại",
                description: error?.message || "Không thể thực hiện thao tác khóa cơ sở lưu trú.",
            });
        } finally {
            setIsLocking(false);
        }
    };

    const handleRestoreAccommodation = async () => {
        if (!detail?.accommodationId) return;
        try {
            setIsLocking(true);
            await restoreAccommodation(detail.accommodationId);
            notification.success({
                message: "Mở khóa thành công",
                description: `Cơ sở lưu trú "${detail.accommodationName}" đã được khôi phục hoạt động.`,
            });
            loadAccommodationDetail();
        } catch (error) {
            console.error("Lỗi mở khóa cơ sở lưu trú:", error);
            notification.error({
                message: "Mở khóa thất bại",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể thực hiện thao tác mở khóa cơ sở lưu trú.",
            });
        } finally {
            setIsLocking(false);
        }
    };

    const typeConfig = detail?.type ? getAccommodationTypeConfig(detail.type) : null;

    // Table columns: Room Types
    const roomTypeColumns = [
        {
            title: "Ảnh",
            dataIndex: "image",
            key: "image",
            width: 85,
            render: (img) => (
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {img ? (
                        <Image
                            src={img}
                            alt="Room"
                            className="w-full h-full object-cover"
                            fallback="https://placehold.co/100x80?text=No+Image"
                        />
                    ) : (
                        <PictureOutlined className="text-slate-400" />
                    )}
                </div>
            ),
        },
        {
            title: "Tên loại phòng",
            dataIndex: "name",
            key: "name",
            render: (name, record) => (
                <div>
                    <div className="font-semibold text-slate-800">{name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Mã ID: #{record.roomTypeId || record.id}</div>
                </div>
            ),
        },
        {
            title: "Đánh giá sao",
            dataIndex: "star",
            key: "star",
            width: 130,
            render: (star) => (
                <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                    <StarFilled />
                    <span>{star ? Number(star).toFixed(1) : "0.0"}</span>
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
                    {price ? `${Number(price).toLocaleString("vi-VN")} ₫` : "Chưa có"}
                </span>
            ),
        },
        {
            title: "Chiết khấu",
            dataIndex: "discount",
            key: "discount",
            align: "center",
            width: 100,
            render: (discount) =>
                discount && Number(discount) > 0 ? (
                    <Tag color="red" className="font-bold text-xs m-0">
                        -{discount}%
                    </Tag>
                ) : (
                    <span className="text-xs text-slate-400">0%</span>
                ),
        },
        {
            title: "Giá thực tế",
            key: "finalPrice",
            align: "right",
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const discount = Number(record.discount) || 0;
                const final = price - (price * discount) / 100;
                return (
                    <span className="font-bold text-blue-600">
                        {final > 0 ? `${final.toLocaleString("vi-VN")} ₫` : "—"}
                    </span>
                );
            },
        },
    ];

    // Table columns: Bookings
    const bookingStatusMap = {
        PENDING: { label: "Chờ xác nhận", color: "gold", icon: <ClockCircleOutlined /> },
        CONFIRMED: { label: "Đã xác nhận", color: "blue", icon: <CheckCircleOutlined /> },
        CHECKED_IN: { label: "Đang lưu trú", color: "cyan", icon: <UserOutlined /> },
        CHECKED_OUT: { label: "Đã trả phòng", color: "green", icon: <CheckCircleOutlined /> },
        CANCELED: { label: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
    };

    const bookingColumns = [
        {
            title: "Mã Đơn",
            dataIndex: "bookingId",
            key: "bookingId",
            width: 90,
            render: (bId) => <span className="font-mono font-semibold text-blue-600">#{bId}</span>,
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            render: (name, record) => (
                <div>
                    <div className="font-semibold text-slate-800">{name || "Khách vãng lai"}</div>
                    <div className="text-xs text-slate-500">{record.customerEmail || record.customerPhone}</div>
                </div>
            ),
        },
        {
            title: "Thời gian lưu trú",
            key: "stayDates",
            render: (_, record) => (
                <div className="text-xs space-y-0.5">
                    <div className="text-slate-700">
                        <span className="font-medium text-slate-500">Vào:</span>{" "}
                        {record.checkInAt ? new Date(record.checkInAt).toLocaleDateString("vi-VN") : "—"}
                    </div>
                    <div className="text-slate-700">
                        <span className="font-medium text-slate-500">Ra:</span>{" "}
                        {record.checkOutAt ? new Date(record.checkOutAt).toLocaleDateString("vi-VN") : "—"}
                    </div>
                </div>
            ),
        },
        {
            title: "Tổng thanh toán",
            dataIndex: "finalPrice",
            key: "finalPrice",
            align: "right",
            render: (price) => (
                <span className="font-bold text-slate-800">
                    {price ? `${Number(price).toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 140,
            render: (status) => {
                const conf = bookingStatusMap[status] || { label: status, color: "default" };
                return (
                    <Tag color={conf.color} icon={conf.icon} className="font-medium px-2.5 py-0.5 m-0 text-xs">
                        {conf.label}
                    </Tag>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[450px] flex flex-col items-center justify-center gap-3">
                <Spin size="large" />
                <span className="text-slate-500 font-medium">Đang tải thông tin chuyên sâu của khách sạn...</span>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="py-12">
                <Empty
                    description="Không tìm thấy dữ liệu cơ sở lưu trú này."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate("/admin/accommodations")}>
                        Quay lại danh sách
                    </Button>
                </Empty>
            </div>
        );
    }

    const coords = {
        lat: Number(detail.latitude || detail.lat || 10.7769),
        lng: Number(detail.longitude || detail.lng || 106.7009),
    };

    const roomTypesList = detail.roomTypes || detail.rooms || [];

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Breadcrumb */}
            <div className="space-y-3">
                <Breadcrumb
                    items={[
                        { title: <Link to="/admin/dashboard">Trang chủ</Link> },
                        { title: <Link to="/admin/accommodations">Quản trị cơ sở lưu trú</Link> },
                        { title: detail.accommodationName },
                    ]}
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1 border-b border-slate-100 pb-4 mt-5">
                    <div className="flex items-center gap-3">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/admin/accommodations")}
                            className="rounded-lg"
                        >
                            Quay lại
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-800 m-0">
                                    {detail.accommodationName}
                                </h1>
                                {detail.isDeleted ? (
                                    <Tag color="error" className="px-2 py-0.5 text-xs font-semibold">
                                        Đã khóa / Ngừng hoạt động
                                    </Tag>
                                ) : (
                                    <Tag color="success" className="px-2 py-0.5 text-xs font-semibold">
                                        ● Đang hoạt động
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                loadAccommodationDetail();
                                loadKpisAndRevenue();
                                loadBookings(bookingPage, bookingPageSize);
                            }}
                        >
                            Làm mới
                        </Button>

                        {detail.isDeleted ? (
                            <Popconfirm
                                title="Mở khóa cơ sở lưu trú này?"
                                description={`Khôi phục và cho phép "${detail.accommodationName}" hoạt động trở lại trên toàn hệ thống.`}
                                onConfirm={handleRestoreAccommodation}
                                okText="Mở khóa ngay"
                                cancelText="Hủy"
                                okButtonProps={{ type: "primary", loading: isLocking }}
                            >
                                <Button
                                    type="primary"
                                    className="bg-emerald-600 hover:bg-emerald-500 border-emerald-600"
                                    icon={<UnlockOutlined />}
                                    loading={isLocking}
                                >
                                    Mở Khóa Cơ Sở Lưu Trú
                                </Button>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="Khóa cơ sở lưu trú này?"
                                description={`Hành động này sẽ khóa và ngừng hiển thị "${detail.accommodationName}" trên toàn hệ thống.`}
                                onConfirm={handleLockAccommodation}
                                okText="Khóa ngay"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true, loading: isLocking }}
                            >
                                <Button danger icon={<LockOutlined />} loading={isLocking}>
                                    Khóa Cơ Sở Lưu Trú
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick KPI Dashboard Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow rounded-xl">
                        <Statistic
                            title={<span className="text-slate-500 text-xs font-medium">Doanh Thu Hôm Nay</span>}
                            value={todayRev}
                            precision={0}
                            valueStyle={{ color: "#16a34a", fontWeight: 700 }}
                            prefix={<DollarCircleOutlined className="mr-1 text-green-500" />}
                            suffix="₫"
                        />
                        <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                            <span>Khách đang lưu trú:</span>
                            <span className="font-semibold text-slate-700">{todayGuestsCount}</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow rounded-xl">
                        <Statistic
                            title={<span className="text-slate-500 text-xs font-medium">Doanh Thu Tháng Này</span>}
                            value={monthRev}
                            precision={0}
                            valueStyle={{ color: "#2563eb", fontWeight: 700 }}
                            prefix={<RiseOutlined className="mr-1 text-blue-500" />}
                            suffix="₫"
                        />
                        <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                            <span>Check-in hôm nay:</span>
                            <span className="font-semibold text-slate-700">{todayCheckinsCount} lượt</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow rounded-xl">
                        <Statistic
                            title={<span className="text-slate-500 text-xs font-medium">Tổng Lượt Đặt Phòng</span>}
                            value={totalBookingsCount}
                            valueStyle={{ color: "#0891b2", fontWeight: 700 }}
                            prefix={<CalendarOutlined className="mr-1 text-cyan-500" />}
                            suffix="đơn"
                        />
                        <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                            <span>Đơn gần nhất:</span>
                            <span className="font-semibold text-slate-700">{bookings.length} gần đây</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow rounded-xl">
                        <Statistic
                            title={<span className="text-slate-500 text-xs font-medium">Quy Mô & Đánh Giá</span>}
                            value={roomTypesList.length}
                            valueStyle={{ color: "#d97706", fontWeight: 700 }}
                            prefix={<AppstoreOutlined className="mr-1 text-amber-500" />}
                            suffix="loại phòng"
                        />
                        <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                            <span>Đánh giá sao:</span>
                            <span className="font-semibold text-amber-600 inline-flex items-center gap-1">
                                <StarFilled className="text-amber-500" />
                                <span>{detail.starRating ? Number(detail.starRating).toFixed(1) : "5.0"}</span>
                            </span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Main Tabs Hub */}
            <Card className="border-slate-200 shadow-xs rounded-2xl" bodyStyle={{ padding: "20px 24px" }}>
                <Tabs
                    defaultActiveKey="overview"
                    items={[
                        {
                            key: "overview",
                            label: (
                                <span className="font-semibold flex items-center gap-1.5">
                                    <HomeOutlined /> Tổng Quan & Vị Trí
                                </span>
                            ),
                            children: (
                                <div className="space-y-6 pt-2">
                                    <Row gutter={[24, 24]}>
                                        {/* Cột trái: Ảnh & Thông tin */}
                                        <Col xs={24} lg={13} className="space-y-4">
                                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm h-72">
                                                {detail.image ? (
                                                    <Image
                                                        src={detail.image}
                                                        alt={detail.accommodationName}
                                                        className="w-full h-full object-cover"
                                                        preview={{ mask: "Phóng to ảnh" }}
                                                        fallback="https://placehold.co/800x450?text=No+Image"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                        <PictureOutlined className="text-5xl mb-2" />
                                                        <span>Chưa có ảnh đại diện</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Descriptions
                                                bordered
                                                size="middle"
                                                column={{ xs: 1, sm: 2 }}
                                                className="bg-slate-50/50 rounded-xl overflow-hidden"
                                            >
                                                <Descriptions.Item label="Mã Khách Sạn">
                                                    <span className="font-mono font-semibold text-blue-600">
                                                        #{detail.accommodationId}
                                                    </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Mã Location ID">
                                                    <span className="font-mono font-semibold text-slate-700">
                                                        #{detail.locationId || "Chưa gán"}
                                                    </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Tỉnh / Thành phố">
                                                    <span className="font-medium text-slate-800">
                                                        {detail.city || "Chưa cập nhật"}
                                                    </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Loại hình lưu trú">
                                                    <Tag color={typeConfig?.tagColor || "blue"}>
                                                        {typeConfig?.label || detail.type}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Địa chỉ chi tiết" span={2}>
                                                    <span className="text-slate-700">{detail.address}</span>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Tọa độ GPS" span={2}>
                                                    <span className="font-mono text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                        Vĩ độ: {coords.lat} | Kinh độ: {coords.lng}
                                                    </span>
                                                </Descriptions.Item>
                                            </Descriptions>

                                            <div>
                                                <Title level={5} className="text-slate-800 mb-2 mt-5">
                                                    Mô tả chỗ nghỉ
                                                </Title>
                                                <Paragraph className="text-slate-600 text-sm whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-0">
                                                    {detail.description || "Chưa có bài giới thiệu chi tiết cho cơ sở lưu trú này."}
                                                </Paragraph>
                                            </div>
                                        </Col>

                                        {/* Cột phải: Bản đồ Leaflet GPS */}
                                        <Col xs={24} lg={11} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <EnvironmentOutlined className="text-blue-500" />
                                                    Bản Đồ Định Vị GPS Thực Tế
                                                </span>
                                                <span className="text-xs text-slate-500">Google Maps Tile</span>
                                            </div>
                                            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                                                <LeafletLocationPicker
                                                    latitude={coords.lat}
                                                    longitude={coords.lng}
                                                    onChange={() => {}}
                                                    height="480px"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 italic text-center mb-0">
                                                Vị trí được xác định dựa trên tọa độ GPS đã lưu trong cơ sở dữ liệu.
                                            </p>
                                        </Col>
                                    </Row>
                                </div>
                            ),
                        },
                        {
                            key: "roomTypes",
                            label: (
                                <span className="font-semibold flex items-center gap-1.5">
                                    <AppstoreOutlined /> Danh Sách Loại Phòng ({roomTypesList.length})
                                </span>
                            ),
                            children: (
                                <div className="pt-2 space-y-4">
                                    <Table
                                        rowKey={(r) => r.roomTypeId || r.id}
                                        columns={roomTypeColumns}
                                        dataSource={roomTypesList}
                                        pagination={false}
                                        locale={{
                                            emptyText: (
                                                <Empty
                                                    description="Khách sạn này chưa tạo loại phòng nào."
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                />
                                            ),
                                        }}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: "bookings",
                            label: (
                                <span className="font-semibold flex items-center gap-1.5">
                                    <CalendarOutlined /> Đơn Đặt Phòng Gần Nhất
                                </span>
                            ),
                            children: (
                                <div className="pt-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">
                                            Theo dõi toàn bộ các đơn đặt phòng của cơ sở lưu trú này theo thời gian thực.
                                        </span>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => loadBookings(bookingPage, bookingPageSize)}
                                            loading={isLoadingBookings}
                                            size="small"
                                        >
                                            Cập nhật đơn
                                        </Button>
                                    </div>

                                    <Table
                                        rowKey="bookingId"
                                        columns={bookingColumns}
                                        dataSource={bookings}
                                        loading={isLoadingBookings}
                                        pagination={{
                                            current: bookingPage,
                                            pageSize: bookingPageSize,
                                            total: totalBookings,
                                            showSizeChanger: true,
                                            pageSizeOptions: ["5", "10", "20", "50"],
                                            onChange: (p, s) => {
                                                setBookingPage(p);
                                                setBookingPageSize(s);
                                            },
                                            showTotal: (total) => `Tổng cộng ${total} đơn đặt phòng`,
                                        }}
                                        locale={{
                                            emptyText: (
                                                <Empty
                                                    description="Chưa phát sinh đơn đặt phòng nào."
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                />
                                            ),
                                        }}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: "reviews",
                            label: (
                                <span className="font-semibold flex items-center gap-1.5">
                                    <MessageOutlined /> Đánh Giá Của Khách Hàng
                                </span>
                            ),
                            children: (
                                <div className="pt-2 space-y-4">
                                    {roomTypesList.length > 0 ? (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Chọn loại phòng để xem đánh giá:
                                            </span>
                                            <Select
                                                className="w-64"
                                                value={selectedRoomTypeId}
                                                onChange={(val) => setSelectedRoomTypeId(val)}
                                                options={roomTypesList.map((r) => ({
                                                    value: r.roomTypeId || r.id,
                                                    label: (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <span>{r.name}</span>
                                                            <span className="text-amber-500 inline-flex items-center gap-0.5 text-xs">
                                                                (<StarFilled className="text-xs" /> {r.star ? Number(r.star).toFixed(1) : "5.0"})
                                                            </span>
                                                        </span>
                                                    ),
                                                }))}
                                            />
                                        </div>
                                    ) : (
                                        <Empty description="Chưa có thông tin phòng để truy vấn đánh giá." />
                                    )}

                                    {isLoadingReviews ? (
                                        <div className="py-8 flex justify-center">
                                            <Spin />
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={reviews}
                                            renderItem={(item) => (
                                                <List.Item className="border-b border-slate-100 py-3">
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                src={item.userImage}
                                                                icon={<UserOutlined />}
                                                                className="bg-blue-500"
                                                            />
                                                        }
                                                        title={
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-slate-800">
                                                                    {item.userFullName || "Khách hàng ẩn danh"}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    {item.createdAt
                                                                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                                                                        : ""}
                                                                </span>
                                                            </div>
                                                        }
                                                        description={
                                                            <div className="space-y-1 mt-1">
                                                                <Rate
                                                                    disabled
                                                                    value={item.rating || 5}
                                                                    className="text-xs"
                                                                />
                                                                <p className="text-slate-600 text-sm mb-0">
                                                                    {item.comment || "Khách hàng không để lại nhận xét bằng lời."}
                                                                </p>
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Empty
                                            description="Chưa có đánh giá nào cho loại phòng này."
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "revenue",
                            label: (
                                <span className="font-semibold flex items-center gap-1.5">
                                    <RiseOutlined /> Báo Cáo Doanh Thu & Thống Kê
                                </span>
                            ),
                            children: (
                                <div className="pt-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Title level={5} className="mb-0 text-slate-800">
                                                Thống Kê Doanh Thu 12 Tháng
                                            </Title>
                                            <span className="text-slate-500 text-xs">
                                                Biểu đồ doanh thu thực tế ghi nhận từ các lượt đặt phòng hoàn tất.
                                            </span>
                                        </div>
                                        <Select
                                            value={selectedYear}
                                            onChange={(yr) => setSelectedYear(yr)}
                                            className="w-32"
                                            options={[
                                                { value: 2026, label: "Năm 2026" },
                                                { value: 2025, label: "Năm 2025" },
                                                { value: 2024, label: "Năm 2024" },
                                            ]}
                                        />
                                    </div>

                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={8}>
                                            <Card className="border-slate-200 bg-blue-50/50 rounded-xl">
                                                <Statistic
                                                    title="Doanh thu lũy kế tháng này"
                                                    value={monthRev}
                                                    suffix="₫"
                                                    valueStyle={{ color: "#1d4ed8", fontWeight: "bold" }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Card className="border-slate-200 bg-emerald-50/50 rounded-xl">
                                                <Statistic
                                                    title="Doanh thu phát sinh hôm nay"
                                                    value={todayRev}
                                                    suffix="₫"
                                                    valueStyle={{ color: "#047857", fontWeight: "bold" }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Card className="border-slate-200 bg-amber-50/50 rounded-xl">
                                                <Statistic
                                                    title="Tổng lượt khách đặt phòng"
                                                    value={totalBookingsCount}
                                                    suffix="đơn"
                                                    valueStyle={{ color: "#b45309", fontWeight: "bold" }}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* Monthly Breakdown Table */}
                                    <div>
                                        <h4 className="text-slate-800 font-semibold mb-3">
                                            Chi tiết doanh thu từng tháng ({selectedYear})
                                        </h4>
                                        {monthlyRevenueList && monthlyRevenueList.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {monthlyRevenueList.map((item, idx) => {
                                                    const monthKey = Object.keys(item)[0] || `Tháng ${idx + 1}`;
                                                    const val = Object.values(item)[0] || 0;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center"
                                                        >
                                                            <div className="text-xs text-slate-500 font-medium">
                                                                {monthKey}
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-800 mt-1">
                                                                {Number(val).toLocaleString("vi-VN")} ₫
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                Chưa có dữ liệu doanh thu chi tiết 12 tháng cho năm {selectedYear}.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default AdminAccommodationDetailPage;
