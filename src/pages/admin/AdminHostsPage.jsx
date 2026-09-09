import { useEffect, useState, useCallback, useMemo } from "react";
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
    Tabs,
    Row,
    Col,
} from "antd";
import {
    UserAddOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined,
    CopyOutlined,
    DeleteOutlined,
    UndoOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    RollbackOutlined,
    StopOutlined,
} from "@ant-design/icons";
import { getAllAccommodations } from "../../services/AccommodationService";
import {
    getAllStaff,
    patchUserStatus,
    deleteUser,
    restoreUser,
} from "../../services/UserService";
import { USER_ROLE_CONFIG, getAccommodationTypeConfig } from "../../config/themeConfig";
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
    { value: "INACTIVE", label: "Tài khoản bị khóa" },
];

const AdminHostsPage = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Chế độ xem thùng rác (isDeleted)
    const [isDeletedView, setIsDeletedView] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHotelId, setSelectedHotelId] = useState("ALL");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Load danh sách khách sạn để hỗ trợ bộ lọc
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

    // Load danh sách nhân sự/host từ GET /api/users/staff?isDeleted=...
    const fetchStaffData = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {
                isDeleted: isDeletedView,
            };
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
                accommodationStaffId: item.accommodationStaffId || item.id,
                hotelId: item.accommodationId,
                hotelName: item.accommodationName || (item.accommodationId ? `Khách sạn #${item.accommodationId}` : "Chưa liên kết"),
                hotelType: item.hotelType,
                roleStaff: item.role || item.staffRole || item.systemRole || "ROLE_MANAGER",
                status: item.status || (item.isActive === false ? "INACTIVE" : "ACTIVE"),
                isDeleted: item.isDeleted !== undefined ? item.isDeleted : (item.isActive !== undefined ? !item.isActive : false),
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
    }, [selectedHotelId, selectedRole, searchTerm, isDeletedView]);

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
        setStatusFilter("ALL");
        setCurrentPage(1);
    };

    // 1. Thao tác Khóa / Mở khóa tài khoản (PATCH /api/users/{userId}/status?status=ACTIVE|INACTIVE)
    const handleToggleUserStatus = async (record, checked) => {
        const newStatus = checked ? "ACTIVE" : "INACTIVE";
        try {
            setIsActionLoading(true);
            await patchUserStatus(record.id, newStatus);
            notification.success({
                message: checked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
                description: `Tài khoản "${record.name || record.email}" đã được chuyển sang trạng thái ${
                    checked ? "HOẠT ĐỘNG" : "TẠM KHÓA"
                }.`,
            });
            fetchStaffData();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái tài khoản:", error);
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái tài khoản.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    // 2. Thao tác Xóa mềm tài khoản người dùng (DELETE /api/users/{userId})
    const handleDeleteUser = async (record) => {
        try {
            setIsActionLoading(true);
            await deleteUser(record.id);
            notification.success({
                message: "Đã chuyển vào thùng rác",
                description: `Tài khoản "${record.name || record.email}" đã được xóa mềm thành công.`,
            });
            fetchStaffData();
        } catch (error) {
            console.error("Lỗi xóa mềm tài khoản:", error);
            notification.error({
                message: "Xóa tài khoản thất bại",
                description: error?.response?.data?.message || error?.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    // 3. Thao tác Khôi phục tài khoản người dùng (PATCH /api/users/{userId}/restore)
    const handleRestoreUser = async (record) => {
        try {
            setIsActionLoading(true);
            await restoreUser(record.id);
            notification.success({
                message: "Khôi phục thành công",
                description: `Tài khoản "${record.name || record.email}" đã được khôi phục về trạng thái hoạt động.`,
            });
            fetchStaffData();
        } catch (error) {
            console.error("Lỗi khôi phục tài khoản:", error);
            notification.error({
                message: "Khôi phục tài khoản thất bại",
                description: error?.response?.data?.message || error?.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsActionLoading(false);
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

    // Thống kê nhanh
    const stats = useMemo(() => {
        const total = staffList.length;
        const activeCount = staffList.filter((s) => s.status === "ACTIVE" && !s.isDeleted).length;
        const lockedCount = staffList.filter((s) => s.status === "INACTIVE" && !s.isDeleted).length;
        return { total, activeCount, lockedCount };
    }, [staffList]);

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

        // Lọc trạng thái (trong tab Đang hoạt động)
        if (!isDeletedView) {
            if (statusFilter === "ACTIVE" && item.status !== "ACTIVE") return false;
            if (statusFilter === "INACTIVE" && item.status !== "INACTIVE") return false;
        }

        return true;
    });

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
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
            width: 200,
            render: (_, record) => (
                <span className="font-semibold text-slate-800 text-xs truncate block">
                    {record.hotelName || `Khách sạn #${record.hotelId}`}
                </span>
            ),
        },
        {
            title: "Loại Chỗ Nghỉ",
            key: "hotelType",
            width: 140,
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
            width: 150,
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
            key: "statusTag",
            width: 140,
            align: "center",
            render: (_, record) => {
                if (record.isDeleted) {
                    return (
                        <Tag color="error">
                            Đã xóa
                        </Tag>
                    );
                }
                if (record.status === "INACTIVE") {
                    return (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                            Bị khóa
                        </Tag>
                    );
                }
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Hoạt động
                    </Tag>
                );
            },
        },
        {
            title: "Hành Động",
            key: "actions",
            width: 140,
            align: "center",
            fixed: "right",
            render: (_, record) => {
                if (record.isDeleted) {
                    return (
                        <Space size="middle">
                            <Tooltip title="Khôi phục tài khoản này">
                                <Popconfirm
                                    title="Khôi phục tài khoản Host?"
                                    description={`Khôi phục hoạt động cho tài khoản "${record.name || record.email}" về bình thường?`}
                                    onConfirm={() => handleRestoreUser(record)}
                                    okText="Khôi phục"
                                    cancelText="Hủy"
                                    okButtonProps={{ type: "primary" }}
                                >
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<RollbackOutlined />}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center"
                                    >
                                        Khôi phục
                                    </Button>
                                </Popconfirm>
                            </Tooltip>
                        </Space>
                    );
                }

                const isCurrentlyActive = record.status !== "INACTIVE";

                return (
                    <Space size="middle">
                        {/* Nút Xem chi tiết hồ sơ */}
                        <Tooltip title="Xem chi tiết hồ sơ">
                            <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined className="text-blue-600 text-base" />}
                                onClick={() => {
                                    setSelectedStaff(record);
                                    setIsDetailModalOpen(true);
                                }}
                            />
                        </Tooltip>

                        {/* Nút Khóa / Mở khóa tài khoản (Giống phòng thực tế) */}
                        <Tooltip
                            title={
                                isCurrentlyActive
                                    ? "Khóa tài khoản (chặn đăng nhập)"
                                    : "Mở khóa tài khoản (cho phép đăng nhập)"
                            }
                        >
                            <Popconfirm
                                title={isCurrentlyActive ? "Khóa tài khoản Host này?" : "Mở khóa tài khoản Host này?"}
                                description={
                                    isCurrentlyActive
                                        ? `Tài khoản "${record.name || record.email}" sẽ không thể đăng nhập vào hệ thống cho đến khi bạn mở khóa lại.`
                                        : `Tài khoản "${record.name || record.email}" sẽ được kích hoạt lại và có thể đăng nhập bình thường.`
                                }
                                onConfirm={() => handleToggleUserStatus(record, !isCurrentlyActive)}
                                okText={isCurrentlyActive ? "Khóa tài khoản" : "Mở khóa"}
                                cancelText="Hủy"
                                okButtonProps={isCurrentlyActive ? { danger: true } : { type: "primary" }}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    className={
                                        isCurrentlyActive
                                            ? "text-amber-500 hover:text-amber-600"
                                            : "text-emerald-600 hover:text-emerald-700"
                                    }
                                    icon={
                                        isCurrentlyActive ? (
                                            <LockOutlined className="text-base" />
                                        ) : (
                                            <UnlockOutlined className="text-base" />
                                        )
                                    }
                                />
                            </Popconfirm>
                        </Tooltip>

                        {/* Nút Xóa mềm (Đưa vào thùng rác) */}
                        <Tooltip title="Xóa mềm (Đưa vào thùng rác)">
                            <Popconfirm
                                title="Xác nhận xóa mềm tài khoản"
                                description={`Bạn có chắc muốn chuyển tài khoản "${record.name || record.email}" vào thùng rác không?`}
                                onConfirm={() => handleDeleteUser(record)}
                                okText="Xóa mềm"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined className="text-base" />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Lý & Cấp Quyền Tài Khoản Host</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Cấp tài khoản quản lý cơ sở lưu trú, quản lý trạng thái khóa/mở và giám sát phân quyền toàn hệ thống.
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

            {/* Thẻ Thống Kê Nhanh */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-500 block">
                                    {isDeletedView ? "Tài Khoản Đã Xóa" : "Tổng Số Tài Khoản"}
                                </span>
                                <span className="text-2xl font-bold text-slate-800 mt-0.5 block">
                                    {stats.total} <span className="text-xs font-normal text-slate-400">nhân sự</span>
                                </span>
                            </div>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                    isDeletedView
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-blue-50 text-blue-600"
                                }`}
                            >
                                {isDeletedView ? <DeleteOutlined /> : <TeamOutlined />}
                            </div>
                        </div>
                    </Card>
                </Col>

                {!isDeletedView && (
                    <>
                        <Col xs={24} sm={8}>
                            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Đang Hoạt Động</span>
                                        <span className="text-2xl font-bold text-emerald-600 mt-0.5 block">
                                            {stats.activeCount} <span className="text-xs font-normal text-slate-400">tài khoản</span>
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                                        <CheckCircleOutlined />
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={8}>
                            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "14px 18px" }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Đang Bị Khóa</span>
                                        <span className="text-2xl font-bold text-amber-600 mt-0.5 block">
                                            {stats.lockedCount} <span className="text-xs font-normal text-slate-400">tài khoản</span>
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                                        <StopOutlined />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </>
                )}
            </Row>

            {/* Filter Section & Tabs */}
            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                {/* Tabs chuyển đổi giữa Danh sách hoạt động và Thùng rác */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
                    <Tabs
                        activeKey={isDeletedView ? "DELETED" : "ACTIVE"}
                        onChange={(key) => {
                            setIsDeletedView(key === "DELETED");
                            setCurrentPage(1);
                        }}
                        className="mb-0"
                        items={[
                            {
                                key: "ACTIVE",
                                label: (
                                    <span className="font-medium flex items-center gap-2">
                                        <TeamOutlined /> Danh Sách Host / Quản Lý
                                    </span>
                                ),
                            },
                            {
                                key: "DELETED",
                                label: (
                                    <span className="font-medium flex items-center gap-2 text-rose-600">
                                        <DeleteOutlined /> Thùng Rác (Đã Xóa)
                                    </span>
                                ),
                            },
                        ]}
                    />
                </div>

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

                    {!isDeletedView && (
                        <div>
                            <Select
                                placeholder="Trạng thái tài khoản"
                                className="w-full"
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={STATUS_FILTER_OPTIONS}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Table Section */}
            <Table
                columns={columns}
                dataSource={filteredStaff}
                rowKey={(record) => `${record.hotelId}-${record.id}`}
                loading={isLoading}
                scroll={{ x: 1350 }}
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
                    showTotal: (total) => `Tổng cộng: ${total} tài khoản`,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-slate-500 text-sm">
                                    {isDeletedView
                                        ? "Thùng rác trống, không có tài khoản nào bị xóa mềm."
                                        : "Không tìm thấy dữ liệu quản lý / nhân sự nào phù hợp."}
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
