import { useContext, useEffect, useState, useCallback } from "react";
import { Card, Input, notification, Empty, Space, Row, Col, Tabs } from "antd";
import {
    SearchOutlined,
    ShopOutlined,
    AppstoreOutlined,
    DollarOutlined,
    RiseOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import RoomTypeTable from "../components/room-types/RoomTypeTable";
import HeaderListRoom from "../components/room-types/HeaderListRoom";
import { globalContext } from "../context/GlobalContext";
import { getHostRoomTypes } from "../services/RoomService";

const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);
};

const ListRoomTypePage = () => {
    const {
        selectedAccommodationId,
        setSelectedAccommodationId,
        currentHotel,
        listHotel
    } = useContext(globalContext);

    const [roomTypesPage, setRoomTypesPage] = useState({
        content: [],
        page: {
            number: 0,
            size: 10,
            totalPages: 0,
            totalElements: 0,
        },
    });
    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeletedView, setIsDeletedView] = useState(false);

    const fetchRoomTypes = useCallback(async () => {
        try {
            setIsLoadingRoomTypes(true);
            const response = await getHostRoomTypes({
                accommodationId: selectedAccommodationId || null,
                isDeleted: isDeletedView,
                page: currentPage,
                size: currentPageSize,
            });

            const rawData = response?.data || response || {};
            const list = Array.isArray(rawData)
                ? rawData
                : Array.isArray(rawData.content)
                ? rawData.content
                : [];

            setRoomTypesPage({
                content: list,
                page: rawData.page || {
                    number: currentPage,
                    size: currentPageSize,
                    totalPages: rawData.totalPages || Math.max(1, Math.ceil(list.length / currentPageSize)),
                    totalElements: rawData.totalElements ?? list.length,
                },
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách loại phòng:", error);
            if (error?.response?.status === 403) {
                notification.warning({
                    message: "Cảnh báo quyền truy cập",
                    description: "Bạn không có quyền quản lý cơ sở này. Hệ thống đã tự động chuyển về chế độ 'Tất cả cơ sở'.",
                });
                setSelectedAccommodationId("");
                return;
            }
            notification.error({
                message: "Không thể tải danh sách loại phòng",
                description: error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi kết nối máy chủ.",
            });
        } finally {
            setIsLoadingRoomTypes(false);
        }
    }, [selectedAccommodationId, isDeletedView, currentPage, currentPageSize, setSelectedAccommodationId]);

    useEffect(() => {
        fetchRoomTypes();
    }, [fetchRoomTypes]);

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

    // Lọc tìm kiếm theo tên loại phòng phía client
    const rawContent = roomTypesPage?.content || [];
    const filteredContent = searchTerm.trim()
        ? rawContent.filter((item) =>
              item.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
        : rawContent;

    // Tính toán chỉ số tóm tắt
    const prices = rawContent.map((r) => Number(r.price) || 0).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const displayedPageData = {
        ...roomTypesPage,
        content: filteredContent,
    };

    return (
        <div className="space-y-6">
            <HeaderListRoom
                fetchRoomTypes={fetchRoomTypes}
                isLoading={isLoadingRoomTypes}
            />

            {/* Thẻ Thống Kê Nhanh Danh Mục Phòng */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="border-slate-200/80 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-500 block">
                                    {isDeletedView ? "Số Loại Phòng Đã Xóa" : "Tổng Số Loại Phòng"}
                                </span>
                                <span className="text-2xl font-bold text-slate-800 mt-0.5 block">
                                    {rawContent.length} <span className="text-xs font-normal text-slate-400">loại</span>
                                </span>
                            </div>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                    isDeletedView
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-blue-50 text-blue-600"
                                }`}
                            >
                                {isDeletedView ? <DeleteOutlined /> : <AppstoreOutlined />}
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className="border-slate-200/80 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-500 block">Giá Thấp Nhất</span>
                                <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                                    {minPrice > 0 ? formatVND(minPrice) : "—"}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                                <DollarOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className="border-slate-200/80 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-500 block">Giá Cao Nhất</span>
                                <span className="text-lg font-bold text-indigo-600 mt-0.5 block">
                                    {maxPrice > 0 ? formatVND(maxPrice) : "—"}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                                <RiseOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Thanh Tab Trạng Thái, Tìm Kiếm & Bảng Dữ Liệu */}
            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
                    <Tabs
                        activeKey={isDeletedView ? "DELETED" : "ACTIVE"}
                        onChange={(key) => {
                            setIsDeletedView(key === "DELETED");
                            setCurrentPage(0);
                        }}
                        className="mb-0"
                        items={[
                            {
                                key: "ACTIVE",
                                label: (
                                    <span className="flex items-center gap-1.5 font-semibold">
                                        <CheckCircleOutlined className="text-emerald-500" />
                                        Đang hoạt động
                                    </span>
                                ),
                            },
                            {
                                key: "DELETED",
                                label: (
                                    <span className="flex items-center gap-1.5 font-semibold">
                                        <DeleteOutlined className="text-rose-500" />
                                        Đã xóa (Thùng rác)
                                    </span>
                                ),
                            },
                        ]}
                    />

                    <div className="w-full sm:w-72">
                        <Input
                            placeholder="Tìm kiếm theo tên loại phòng..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                            size="middle"
                        />
                    </div>
                </div>

                <RoomTypeTable
                    roomTypesPage={displayedPageData}
                    setRoomTypesPage={setRoomTypesPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    currentPageSize={currentPageSize}
                    setCurrentPageSize={setCurrentPageSize}
                    isLoadingRoomTypes={isLoadingRoomTypes}
                    setIsLoadingRoomTypes={setIsLoadingRoomTypes}
                    fetchRoomTypes={fetchRoomTypes}
                    isDeletedView={isDeletedView}
                />
            </Card>
        </div>
    );
};

export default ListRoomTypePage;