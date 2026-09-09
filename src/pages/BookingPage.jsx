import { notification, Tabs, Card, Empty, Button, Tag, Space } from "antd";
import { ReloadOutlined, CalendarOutlined, ShopOutlined } from "@ant-design/icons";
import BookingTable from "../components/booking/BookingTable";
import { useContext, useEffect, useState, useCallback } from "react";
import { globalContext } from "../context/GlobalContext";
import { getHostBookings } from "../services/BookingService";

const STATUS_TABS = [
    { key: "", label: "Tất cả đơn" },
    { key: "PENDING", label: "Chờ nhận phòng" },
    { key: "CHECKED_IN", label: "Đang lưu trú" },
    { key: "CHECKED_OUT", label: "Đã trả phòng" },
    { key: "WAITING_FOR_PAYMENT", label: "Chờ thanh toán" },
    { key: "CANCELED", label: "Đã hủy" },
];

const BookingPage = () => {
    const {
        selectedAccommodationId,
        setSelectedAccommodationId,
        currentHotel,
        listHotel,
    } = useContext(globalContext);

    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [bookingPage, setBookingPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 10,
            totalPages: 0,
            totalElements: 0,
        },
    });

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getHostBookings({
                accommodationId: selectedAccommodationId || null,
                status: statusFilter || null,
                page: currentPage,
                size: currentPageSize,
            });

            const rawData = response?.data || response || [];
            const list = Array.isArray(rawData)
                ? rawData
                : Array.isArray(rawData.content)
                    ? rawData.content
                    : [];

            setBookingPage({
                content: list,
                page: rawData.page || {
                    number: currentPage,
                    size: currentPageSize,
                    totalPages: rawData.totalPages || Math.max(1, Math.ceil(list.length / currentPageSize)),
                    totalElements: rawData.totalElements ?? list.length,
                },
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn đặt phòng:", error);
            if (error?.response?.status === 403) {
                notification.warning({
                    message: "Cảnh báo quyền truy cập",
                    description: "Bạn không có quyền quản lý cơ sở này. Hệ thống đã tự động chuyển về chế độ 'Tất cả cơ sở'.",
                });
                setSelectedAccommodationId("");
                return;
            }
            notification.error({
                message: "Không thể tải danh sách đơn đặt phòng",
                description: error?.response?.data?.message || error?.message || "Đã có lỗi xảy ra khi kết nối máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedAccommodationId, statusFilter, currentPage, currentPageSize, setSelectedAccommodationId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    if (!listHotel || listHotel.length === 0) {
        return (
            <Card className="border-slate-200 text-center py-12">
                <Empty
                    image={<ShopOutlined style={{ fontSize: 56, color: "#94a3b8" }} />}
                    description={
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-700">Chưa có cơ sở lưu trú</h3>
                            <p className="text-slate-500 text-xs">
                                Tài khoản của bạn hiện chưa được phân công phụ trách cơ sở lưu trú nào.
                            </p>
                        </div>
                    }
                />
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800 m-0">
                            Quản Lý Đơn Đặt Phòng
                        </h1>
                        {/* {currentHotel ? (
                            <Tag color="blue" className="font-semibold text-xs m-0">
                                #{currentHotel.accommodationId} - {currentHotel.accommodationName}
                            </Tag>
                        ) : (
                            <Tag color="geekblue" className="font-semibold text-xs m-0">
                                Tất Cả Cơ Sở ({listHotel?.length || 0})
                            </Tag>
                        )} */}
                    </div>
                    {/* <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Theo dõi danh sách khách lưu trú, thời gian nhận/trả phòng và trạng thái thanh toán.
                    </p> */}
                </div>

                <Button
                    icon={<ReloadOutlined spin={isLoading} />}
                    onClick={fetchBookings}
                >
                    Làm mới
                </Button>
            </div>

            {/* Filter Tabs by Status */}
            <div className="bg-white rounded-xl">
                <Tabs
                    activeKey={statusFilter}
                    onChange={(key) => {
                        setStatusFilter(key);
                        setCurrentPage(0);
                    }}
                    items={STATUS_TABS.map((tab) => ({
                        key: tab.key,
                        label: tab.label,
                    }))}
                />

                <BookingTable
                    bookingPage={bookingPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    currentPageSize={currentPageSize}
                    setCurrentPageSize={setCurrentPageSize}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default BookingPage;
