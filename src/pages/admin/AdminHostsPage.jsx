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
    Dropdown,
    Badge,
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
    HomeOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import { getAllAccommodations } from "../../services/AccommodationService";
import {
    getHostGrouped,
    patchStaffStatus,
    deleteStaff,
    restoreStaff,
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
    const [hostList, setHostList] = useState([]);
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
    const [selectedHost, setSelectedHost] = useState(null);

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

    // Load danh sách Host / Nhân sự gom nhóm (User-Centric) từ GET /api/users/hosts
    const fetchHostData = useCallback(async () => {
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

            const response = await getHostGrouped(params);
            const list = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                ? response
                : [];

            setHostList(list);
        } catch (error) {
            console.error("Lỗi tải danh sách host/nhân sự:", error);
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
        fetchHostData();
    }, [fetchHostData]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedHotelId("ALL");
        setSelectedRole("ALL");
        setStatusFilter("ALL");
        setCurrentPage(1);
    };

    // =========================================================================
    // 1. THAO TÁC CẤP ĐƠN VỊ TRỰC THUỘC (UNIT-LEVEL ACTIONS - accommodationStaffId)
    // =========================================================================
    const handleUnitStatus = async (acc, newStatus) => {
        try {
            setIsActionLoading(true);
            await patchStaffStatus(acc.accommodationStaffId, newStatus);
            notification.success({
                message: newStatus === "ACTIVE" ? "Đã mở khóa tại đơn vị" : "Đã khóa tại đơn vị",
                description: `Đã cập nhật trạng thái làm việc tại cơ sở "${acc.accommodationName}".`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái tại đơn vị:", error);
            notification.error({
                message: "Thao tác thất bại",
                description: error?.response?.data?.message || "Không thể cập nhật trạng thái tại đơn vị này.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUnitDelete = async (acc) => {
        try {
            setIsActionLoading(true);
            await deleteStaff(acc.accommodationStaffId);
            notification.success({
                message: "Đã cho nghỉ việc tại đơn vị",
                description: `Đã đánh dấu nhân sự nghỉ việc tại "${acc.accommodationName}".`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi cho nghỉ việc tại đơn vị:", error);
            notification.error({
                message: "Thao tác thất bại",
                description: error?.response?.data?.message || "Không thể xử lý nghỉ việc tại đơn vị này.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUnitRestore = async (acc) => {
        try {
            setIsActionLoading(true);
            await restoreStaff(acc.accommodationStaffId);
            notification.success({
                message: "Khôi phục thành công",
                description: `Đã khôi phục nhân sự làm việc trở lại tại "${acc.accommodationName}".`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi khôi phục tại đơn vị:", error);
            notification.error({
                message: "Khôi phục thất bại",
                description: error?.response?.data?.message || "Không thể khôi phục nhân sự tại đơn vị này.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    // =========================================================================
    // 2. THAO TÁC CẤP TOÀN BỘ TÀI KHOẢN (ACCOUNT-LEVEL ACTIONS - userId / id)
    // =========================================================================
    const handleAccountStatus = async (user, newStatus) => {
        try {
            setIsActionLoading(true);
            await patchUserStatus(user.id, newStatus);
            notification.success({
                message: newStatus === "ACTIVE" ? "Đã mở khóa tài khoản" : "Đã khóa toàn bộ tài khoản",
                description: `Tài khoản "${user.name || user.email}" đã được chuyển sang trạng thái ${
                    newStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "BỊ KHÓA"
                }.`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái tài khoản:", error);
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || "Không thể cập nhật trạng thái tài khoản.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAccountDelete = async (user) => {
        try {
            setIsActionLoading(true);
            await deleteUser(user.id);
            notification.success({
                message: "Đã chuyển vào thùng rác",
                description: `Tài khoản "${user.name || user.email}" đã được xóa mềm toàn hệ thống.`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi xóa mềm tài khoản:", error);
            notification.error({
                message: "Xóa tài khoản thất bại",
                description: error?.response?.data?.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAccountRestore = async (user) => {
        try {
            setIsActionLoading(true);
            await restoreUser(user.id);
            notification.success({
                message: "Khôi phục thành công",
                description: `Tài khoản "${user.name || user.email}" đã được khôi phục về trạng thái hoạt động.`,
            });
            fetchHostData();
        } catch (error) {
            console.error("Lỗi khôi phục tài khoản:", error);
            notification.error({
                message: "Khôi phục tài khoản thất bại",
                description: error?.response?.data?.message || "Vui lòng thử lại.",
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
        const total = hostList.length;
        const activeCount = hostList.filter((s) => s.status === "ACTIVE" && !s.isDeleted).length;
        const lockedCount = hostList.filter((s) => s.status === "INACTIVE" && !s.isDeleted).length;
        return { total, activeCount, lockedCount };
    }, [hostList]);

    // Lọc dữ liệu hiển thị phía Client
    const filteredHosts = hostList.filter((item) => {
        // Lọc từ khóa
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            const nameMatch = item.name && item.name.toLowerCase().includes(term);
            const emailMatch = item.email && item.email.toLowerCase().includes(term);
            const phoneMatch = item.phone && item.phone.toLowerCase().includes(term);
            const accMatch = item.accommodations?.some((acc) =>
                acc.accommodationName?.toLowerCase().includes(term)
            );
            if (!nameMatch && !emailMatch && !phoneMatch && !accMatch) return false;
        }

        // Lọc vai trò
        if (selectedRole !== "ALL") {
            const hasRole = item.accommodations?.some((acc) => acc.role === selectedRole);
            if (!hasRole) return false;
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
            title: "Họ và Tên",
            key: "hostInfo",
            width: 230,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={42}
                        src={record.avatarUrl}
                        icon={<UserOutlined />}
                        className="bg-blue-600 border border-slate-200 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 text-sm truncate">
                            {record.name || "Chưa đặt tên"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="truncate max-w-[140px]">{record.email}</span>
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
                        <span className="text-[11px] text-slate-400 font-mono">
                            {record.phone || "Chưa có SĐT"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: "Vai Trò Hệ Thống",
            dataIndex: "systemRole",
            key: "systemRole",
            width: 140,
            align: "center",
            render: (role) => (
                <Tag color={role === "ROLE_ADMIN" ? "red" : "blue"} className="font-semibold px-2.5 py-0.5">
                    {role === "ROLE_ADMIN" ? "Admin" : "Host"}
                </Tag>
            ),
        },
        {
            title: "Trạng Thái Tài Khoản",
            key: "accountStatus",
            width: 160,
            align: "center",
            render: (_, record) => {
                if (record.isDeleted) {
                    return <Badge status="error" text={<span className="text-xs font-medium text-rose-600">Đã xóa mềm</span>} />;
                }
                if (record.status === "ACTIVE") {
                    return <Badge status="success" text={<span className="text-xs font-medium text-emerald-600">Đang hoạt động</span>} />;
                }
                return <Badge status="warning" text={<span className="text-xs font-medium text-amber-600">Bị khóa tài khoản</span>} />;
            },
        },
        {
            title: "Đơn Vị Trực Thuộc (Accommodations)",
            key: "accommodations",
            width: 320,
            render: (_, record) => (
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                    {record.accommodations && record.accommodations.length > 0 ? (
                        record.accommodations.map((acc) => {
                            const menuItems = [
                                acc.status === "ACTIVE"
                                    ? {
                                          key: "lock-unit",
                                          icon: <LockOutlined className="text-amber-500" />,
                                          label: "Khóa tại đơn vị này",
                                          onClick: () => handleUnitStatus(acc, "INACTIVE"),
                                      }
                                    : {
                                          key: "unlock-unit",
                                          icon: <UnlockOutlined className="text-emerald-600" />,
                                          label: "Mở khóa tại đơn vị này",
                                          onClick: () => handleUnitStatus(acc, "ACTIVE"),
                                      },
                                !acc.isDeleted
                                    ? {
                                          key: "delete-unit",
                                          danger: true,
                                          icon: <DeleteOutlined />,
                                          label: "Cho nghỉ việc tại đơn vị này",
                                          onClick: () => handleUnitDelete(acc),
                                      }
                                    : {
                                          key: "restore-unit",
                                          icon: <UndoOutlined className="text-emerald-600" />,
                                          label: "Khôi phục làm việc tại đơn vị này",
                                          onClick: () => handleUnitRestore(acc),
                                      },
                            ];

                            return (
                                <Dropdown key={acc.accommodationStaffId} menu={{ items: menuItems }} trigger={["click"]}>
                                    <Tag
                                        className="cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:shadow-xs transition-all text-xs"
                                        color={
                                            acc.isDeleted
                                                ? "default"
                                                : acc.status === "ACTIVE"
                                                ? "geekblue"
                                                : "gold"
                                        }
                                    >
                                        <HomeOutlined />
                                        <span className={acc.isDeleted ? "line-through text-slate-400" : "font-medium"}>
                                            {acc.accommodationName} ({acc.role === "ROLE_MANAGER" ? "QL" : "LT"})
                                        </span>
                                        <MoreOutlined className="text-[10px] ml-0.5 opacity-60" />
                                    </Tag>
                                </Dropdown>
                            );
                        })
                    ) : (
                        <span className="text-slate-400 italic text-xs">Chưa gắn đơn vị nào</span>
                    )}
                </div>
            ),
        },
        {
            title: "Hành Động Toàn Tài Khoản",
            key: "actions",
            width: 150,
            align: "center",
            fixed: "right",
            render: (_, record) => {
                if (record.isDeleted) {
                    return (
                        <Space size="middle">
                            <Tooltip title="Khôi phục toàn bộ tài khoản">
                                <Popconfirm
                                    title="Khôi phục tài khoản Host?"
                                    description={`Khôi phục hoạt động cho tài khoản "${record.name || record.email}" về bình thường?`}
                                    onConfirm={() => handleAccountRestore(record)}
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
                                    setSelectedHost(record);
                                    setIsDetailModalOpen(true);
                                }}
                            />
                        </Tooltip>

                        {/* Nút Khóa / Mở khóa toàn bộ tài khoản */}
                        <Tooltip
                            title={
                                isCurrentlyActive
                                    ? "Khóa toàn bộ tài khoản (chặn đăng nhập)"
                                    : "Mở khóa toàn bộ tài khoản (cho phép đăng nhập)"
                            }
                        >
                            <Popconfirm
                                title={isCurrentlyActive ? "Khóa toàn bộ tài khoản?" : "Mở khóa toàn bộ tài khoản?"}
                                description={
                                    isCurrentlyActive
                                        ? `Tài khoản "${record.name || record.email}" sẽ bị từ chối đăng nhập vào toàn bộ hệ thống.`
                                        : `Tài khoản "${record.name || record.email}" sẽ được kích hoạt lại và có thể đăng nhập bình thường.`
                                }
                                onConfirm={() => handleAccountStatus(record, isCurrentlyActive ? "INACTIVE" : "ACTIVE")}
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

                        {/* Nút Xóa mềm toàn bộ tài khoản */}
                        <Tooltip title="Xóa mềm toàn bộ tài khoản">
                            <Popconfirm
                                title="Xác nhận xóa mềm tài khoản"
                                description={`Bạn có chắc muốn chuyển tài khoản "${record.name || record.email}" vào thùng rác? Toàn bộ quyền truy cập sẽ bị đình chỉ.`}
                                onConfirm={() => handleAccountDelete(record)}
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

    // Sub-table hiển thị chi tiết các cơ sở trực thuộc khi bấm mở rộng hàng
    const expandedRowRender = (record) => {
        const subColumns = [
            {
                title: "Mã Đơn Vị",
                dataIndex: "accommodationId",
                key: "accommodationId",
                width: 100,
                render: (id) => <span className="font-mono text-xs font-semibold">#{id}</span>,
            },
            {
                title: "Tên Cơ Sở Lưu Trú",
                dataIndex: "accommodationName",
                key: "accommodationName",
                render: (text) => <span className="font-semibold text-slate-800 text-xs">{text}</span>,
            },
            {
                title: "Loại Hình",
                dataIndex: "hotelType",
                key: "hotelType",
                width: 120,
                render: (type) => {
                    const cfg = getAccommodationTypeConfig(type);
                    return <Tag color={cfg?.tagColor || "default"}>{cfg?.label || type}</Tag>;
                },
            },
            {
                title: "Vai Trò Tại Cơ Sở",
                dataIndex: "role",
                key: "role",
                width: 150,
                render: (role) => {
                    const cfg = USER_ROLE_CONFIG[role];
                    return <Tag color={cfg?.tagColor || "blue"}>{cfg?.label || role}</Tag>;
                },
            },
            {
                title: "Trạng Thái Tại Cơ Sở",
                key: "unitStatus",
                width: 160,
                align: "center",
                render: (_, acc) => {
                    if (acc.isDeleted) {
                        return <Tag color="error">Đã nghỉ việc</Tag>;
                    }
                    if (acc.status === "INACTIVE") {
                        return <Tag icon={<CloseCircleOutlined />} color="warning">Tạm khóa tại cơ sở</Tag>;
                    }
                    return <Tag icon={<CheckCircleOutlined />} color="success">Đang làm việc</Tag>;
                },
            },
            {
                title: "Thao Tác Tại Cơ Sở",
                key: "unitActions",
                width: 160,
                align: "center",
                render: (_, acc) => {
                    if (acc.isDeleted) {
                        return (
                            <Popconfirm
                                title="Khôi phục nhân sự tại cơ sở này?"
                                onConfirm={() => handleUnitRestore(acc)}
                                okText="Khôi phục"
                                cancelText="Hủy"
                            >
                                <Button size="small" type="link" className="text-emerald-600 p-0 font-medium">
                                    Khôi phục làm việc
                                </Button>
                            </Popconfirm>
                        );
                    }

                    const isUnitActive = acc.status === "ACTIVE";
                    return (
                        <Space size="small">
                            <Popconfirm
                                title={isUnitActive ? "Khóa tại cơ sở này?" : "Mở khóa tại cơ sở này?"}
                                description={`Cập nhật quyền làm việc của nhân sự tại "${acc.accommodationName}".`}
                                onConfirm={() => handleUnitStatus(acc, isUnitActive ? "INACTIVE" : "ACTIVE")}
                                okText={isUnitActive ? "Khóa" : "Mở khóa"}
                                cancelText="Hủy"
                            >
                                <Button
                                    size="small"
                                    type="text"
                                    className={isUnitActive ? "text-amber-500" : "text-emerald-600"}
                                    icon={isUnitActive ? <LockOutlined /> : <UnlockOutlined />}
                                >
                                    {isUnitActive ? "Khóa" : "Mở"}
                                </Button>
                            </Popconfirm>

                            <Popconfirm
                                title="Xác nhận cho nghỉ việc tại cơ sở này?"
                                onConfirm={() => handleUnitDelete(acc)}
                                okText="Nghỉ việc"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                                    Nghỉ việc
                                </Button>
                            </Popconfirm>
                        </Space>
                    );
                },
            },
        ];

        return (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <HomeOutlined /> Danh sách cơ sở lưu trú phụ trách ({record.accommodations?.length || 0})
                </div>
                <Table
                    columns={subColumns}
                    dataSource={record.accommodations || []}
                    rowKey="accommodationStaffId"
                    pagination={false}
                    size="small"
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Lý & Cấp Quyền Tài Khoản Host</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Quản lý người dùng gom nhóm theo tài khoản (User-Centric) kèm danh sách các đơn vị trực thuộc toàn hệ thống.
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
                                    {stats.total} <span className="text-xs font-normal text-slate-400">người dùng</span>
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
                            placeholder="Tìm theo tên, email, SĐT, cơ sở..."
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

            {/* Table Section (User-Centric with Expandable Sub-table) */}
            <Table
                columns={columns}
                dataSource={filteredHosts}
                rowKey="id"
                loading={isLoading || isActionLoading}
                scroll={{ x: 1300 }}
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.accommodations && record.accommodations.length > 0,
                }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredHosts.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total) => `Tổng cộng: ${total} người dùng`,
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
                    fetchHostData();
                }}
            />

            {/* Modal Xem Chi Tiết Hồ Sơ Host */}
            <HostDetailModal
                open={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedHost(null);
                }}
                staffId={selectedHost?.id}
                hotelName={selectedHost?.accommodations?.[0]?.accommodationName}
                roleStaff={selectedHost?.accommodations?.[0]?.role}
            />
        </div>
    );
};

export default AdminHostsPage;
