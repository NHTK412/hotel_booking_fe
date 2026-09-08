import { useEffect, useState, useCallback } from "react";
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Space,
    Popconfirm,
    notification,
    Card,
    Tooltip,
    Avatar,
    Empty,
} from "antd";
import {
    UserAddOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    ReloadOutlined,
    SearchOutlined,
    HomeOutlined,
    UserOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { getAllAccommodations } from "../../services/AccommodationService";
import { getAllStaff, getStaffByHotel, deleteStaff, restoreStaff } from "../../services/UserService";
import { USER_ROLE_CONFIG, ACCOMMODATION_TYPE_CONFIG, getAccommodationTypeConfig } from "../../config/themeConfig";
import CreateHostModal from "../../components/admin/CreateHostModal";
import HostDetailModal from "../../components/admin/HostDetailModal";

const ROLE_FILTER_OPTIONS = [
    { value: "ALL", label: "Tất cả vai trò" },
    { value: "ROLE_MANAGER", label: "Chủ khách sạn / Quản lý" },
    { value: "ROLE_RECEPTIONIST", label: "Nhân viên lễ tân" },
];

const STATUS_FILTER_OPTIONS = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "LOCKED", label: "Đã khóa / Tạm ngưng" },
];

const AdminHostsPage = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHotelId, setSelectedHotelId] = useState("ALL");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ACTIVE");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Load danh sách khách sạn
    const loadAccommodations = async () => {
        try {
            const response = await getAllAccommodations({
                page: 0,
                size: 200,
                includeDeleted: true,
            });
            const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setAccommodations(list);
            return list;
        } catch (error) {
            console.error("Lỗi lấy danh sách khách sạn:", error);
            notification.error({
                message: "Không thể tải danh sách cơ sở lưu trú",
                description: "Vui lòng thử lại sau.",
            });
            return [];
        }
    };

    // Load danh sách nhân sự/host sử dụng endpoint GET /api/users/staff
    const fetchStaffData = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedHotelId && selectedHotelId !== "ALL") {
                params.accommodationId = Number(selectedHotelId);
            }
            if (selectedRole && selectedRole !== "ALL") {
                params.role = selectedRole;
            }
            if (searchTerm && searchTerm.trim()) {
                params.keyword = searchTerm.trim();
            }

            const response = await getAllStaff(params);
            const list = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                ? response
                : [];

            const aggregated = list.map((item) => ({
                ...item,
                id: item.id || item.userId,
                hotelId: item.accommodationId,
                hotelName: item.accommodationName || (item.accommodationId ? `Khách sạn #${item.accommodationId}` : "Chưa liên kết"),
                hotelType: item.hotelType,
                roleStaff: item.role || item.staffRole || item.systemRole || "ROLE_MANAGER",
                isDeleted: item.isActive !== undefined ? !item.isActive : !!item.isDeleted,
            }));

            setStaffList(aggregated);
        } catch (error) {
            console.error("Lỗi tải danh sách nhân sự:", error);
            notification.error({
                message: "Không thể tải danh sách nhân sự",
                description: error?.message || "Đã xảy ra lỗi khi kết nối tới máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedHotelId, selectedRole, searchTerm]);

    useEffect(() => {
        loadAccommodations();
    }, []);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedHotelId("ALL");
        setSelectedRole("ALL");
        setStatusFilter("ACTIVE");
        setCurrentPage(1);
    };

    // Thao tác khóa nhân sự (xóa mềm)
    const handleLockStaff = async (record) => {
        try {
            await deleteStaff(record.hotelId, record.id);
            notification.success({
                message: "Đã khóa tài khoản nhân sự",
                description: `Tài khoản "${record.name}" đã được chuyển sang trạng thái tạm ngưng.`,
            });
            fetchStaffData();
        } catch (error) {
            console.error("Lỗi khóa nhân sự:", error);
            notification.error({
                message: "Khóa tài khoản thất bại",
                description: error?.response?.data?.message || error?.message || "Vui lòng thử lại.",
            });
        }
    };

    // Thao tác mở khóa nhân sự
    const handleRestoreStaff = async (record) => {
        try {
            await restoreStaff(record.hotelId, record.id);
            notification.success({
                message: "Đã khôi phục tài khoản",
                description: `Tài khoản "${record.name}" đã được kích hoạt lại thành công.`,
            });
            fetchStaffData();
        } catch (error) {
            console.error("Lỗi khôi phục nhân sự:", error);
            notification.error({
                message: "Khôi phục tài khoản thất bại",
                description: error?.response?.data?.message || error?.message || "Vui lòng thử lại.",
            });
        }
    };

    const handleCopyText = (text, label) => {
        navigator.clipboard.writeText(text);
        notification.success({
            message: "Đã sao chép",
            description: `Đã sao chép ${label} vào bộ nhớ tạm.`,
            duration: 1.5,
        });
    };

    // Lọc dữ liệu hiển thị phía Client
    const filteredStaff = staffList.filter((item) => {
        // Lọc từ khóa
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            const nameMatch = item.name && item.name.toLowerCase().includes(term);
            const emailMatch = item.email && item.email.toLowerCase().includes(term);
            const phoneMatch = item.phone && item.phone.toLowerCase().includes(term);
            const hotelMatch = item.hotelName && item.hotelName.toLowerCase().includes(term);
            if (!nameMatch && !emailMatch && !phoneMatch && !hotelMatch) return false;
        }

        // Lọc vai trò
        if (selectedRole !== "ALL") {
            const currentRole = item.roleStaff || item.role;
            if (currentRole !== selectedRole) return false;
        }

        // Lọc trạng thái
        if (statusFilter === "ACTIVE" && item.isDeleted) return false;
        if (statusFilter === "LOCKED" && !item.isDeleted) return false;

        return true;
    });

    const columns = [
        {
            title: "ID Host",
            dataIndex: "id",
            key: "id",
            width: 95,
            align: "center",
            render: (id) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    #{id}
                </span>
            ),
        },
        {
            title: "Nhân Sự / Quản Lý",
            key: "staffInfo",
            width: 220,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={40}
                        src={record.avatarUrl}
                        icon={<UserOutlined />}
                        className="bg-blue-600 border border-slate-200 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 text-sm truncate">
                            {record.name || "Chưa đặt tên"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {record.gender || "Nhân sự"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: "Thông Tin Liên Hệ",
            key: "contact",
            width: 230,
            render: (_, record) => (
                <div className="flex flex-col text-xs text-slate-600 gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 font-medium truncate">{record.email}</span>
                        {record.email && (
                            <Tooltip title="Sao chép email">
                                <Button
                                    type="text"
                                    size="small"
                                    className="!p-0 !h-auto text-slate-400 hover:text-blue-600"
                                    icon={<CopyOutlined className="text-xs" />}
                                    onClick={() => handleCopyText(record.email, "Email")}
                                />
                            </Tooltip>
                        )}
                    </div>
                    <span className="text-slate-500 font-mono">{record.phone || "—"}</span>
                </div>
            ),
        },
        {
            title: "Mã Cơ Sở",
            dataIndex: "hotelId",
            key: "hotelId",
            width: 95,
            align: "center",
            render: (hotelId) => (
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    #{hotelId || "—"}
                </span>
            ),
        },
        {
            title: "Cơ Sở Lưu Trú Phụ Trách",
            key: "hotel",
            width: 220,
            render: (_, record) => (
                <span className="font-semibold text-slate-800 text-xs truncate block">
                    {record.hotelName || `Khách sạn #${record.hotelId}`}
                </span>
            ),
        },
        {
            title: "Loại Cơ Sở Lưu Trú",
            key: "hotelType",
            width: 170,
            render: (_, record) => {
                const typeCfg = getAccommodationTypeConfig(record.hotelType);
                return (
                    <Tag color={typeCfg?.tagColor || "default"} className="font-medium text-xs px-2 py-0.5 m-0">
                        {typeCfg?.label || record.hotelType || "Chỗ nghỉ"}
                    </Tag>
                );
            },
        },
        {
            title: "Vai Trò",
            key: "role",
            width: 170,
            render: (_, record) => {
                const role = record.roleStaff || record.role || "ROLE_MANAGER";
                const roleConfig = USER_ROLE_CONFIG[role];
                return (
                    <Tag color={roleConfig?.tagColor || "blue"} className="font-semibold px-2.5 py-0.5">
                        {roleConfig?.label || role}
                    </Tag>
                );
            },
        },
        {
            title: "Trạng Thái",
            key: "status",
            width: 130,
            align: "center",
            render: (_, record) =>
                record.isDeleted ? (
                    <Tag color="error" className="font-medium">
                        Đã khóa
                    </Tag>
                ) : (
                    <Tag color="success" className="font-medium">
                        Hoạt động
                    </Tag>
                ),
        },
        {
            title: "Hành Động",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết hồ sơ">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-blue-600 text-base" />}
                            onClick={() => {
                                setSelectedStaff(record);
                                setIsDetailModalOpen(true);
                            }}
                        />
                    </Tooltip>

                    {record.isDeleted ? (
                        <Tooltip title="Mở khóa tài khoản">
                            <Popconfirm
                                title="Mở khóa tài khoản nhân sự"
                                description={`Khôi phục hoạt động cho nhân sự "${record.name}"?`}
                                onConfirm={() => handleRestoreStaff(record)}
                                okText="Mở khóa"
                                cancelText="Hủy"
                                okButtonProps={{ type: "primary" }}
                            >
                                <Button
                                    type="text"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    icon={<UnlockOutlined className="text-base" />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Khóa tài khoản (Tạm ngưng)">
                            <Popconfirm
                                title="Khóa tài khoản nhân sự"
                                description={`Bạn có chắc muốn khóa tài khoản "${record.name}" không?`}
                                onConfirm={() => handleLockStaff(record)}
                                okText="Khóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<LockOutlined className="text-base" />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section matching AdminAccommodationsPage */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Lý & Cấp Quyền Tài Khoản Host</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Cấp tài khoản quản lý cơ sở lưu trú và giám sát phân quyền chủ khách sạn, lễ tân toàn hệ thống.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button icon={<ReloadOutlined />} onClick={handleResetFilters} loading={isLoading}>
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                        size="middle"
                    >
                        Cấp Host Mới
                    </Button>
                </div>
            </div>

            {/* Filter Section matching AdminAccommodationsPage */}
            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <Input
                            placeholder="Tìm theo tên, email, SĐT..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            allowClear
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Lọc theo khách sạn"
                            className="w-full"
                            showSearch
                            value={selectedHotelId}
                            onChange={(val) => {
                                setSelectedHotelId(val);
                                setCurrentPage(1);
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={[
                                { value: "ALL", label: "Tất cả cơ sở lưu trú" },
                                ...accommodations.map((acc) => ({
                                    value: String(acc.accommodationId),
                                    label: `${acc.accommodationName}`,
                                })),
                            ]}
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Vai trò nhân sự"
                            className="w-full"
                            value={selectedRole}
                            onChange={(val) => {
                                setSelectedRole(val);
                                setCurrentPage(1);
                            }}
                            options={ROLE_FILTER_OPTIONS}
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Trạng thái"
                            className="w-full"
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            options={STATUS_FILTER_OPTIONS}
                        />
                    </div>
                </div>
            </Card>

            {/* Table Section */}
            <Table
                columns={columns}
                dataSource={filteredStaff}
                rowKey={(record) => `${record.hotelId}-${record.id}`}
                loading={isLoading}
                scroll={{ x: 1250 }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredStaff.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total) => `Tổng cộng: ${total} nhân sự`,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-slate-500 text-sm">
                                    Không tìm thấy dữ liệu quản lý / nhân sự nào phù hợp.
                                </div>
                            }
                        />
                    ),
                }}
                className="border border-slate-100 rounded-lg overflow-hidden shadow-2xs"
            />

            {/* Modal Cấp Host Mới */}
            <CreateHostModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchStaffData();
                }}
            />

            {/* Modal Xem Chi Tiết Hồ Sơ Host */}
            <HostDetailModal
                open={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStaff(null);
                }}
                staffId={selectedStaff?.id}
                hotelName={selectedStaff?.hotelName}
                roleStaff={selectedStaff?.roleStaff || selectedStaff?.role}
            />
        </div>
    );
};

export default AdminHostsPage;
