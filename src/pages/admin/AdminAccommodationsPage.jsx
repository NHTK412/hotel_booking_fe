import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Image,
    Space,
    Popconfirm,
    notification,
    Card,
    Tooltip,
    Empty,
} from "antd";
import {
    PlusOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    ReloadOutlined,
    SearchOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import {
    getAllAccommodations,
    deleteAccommodation,
    restoreAccommodation,
} from "../../services/AccommodationService";
import { getAllProvinceNames, getDistrictsByProvinceName } from "../../services/LocationService";
import { ACCOMMODATION_TYPE_CONFIG } from "../../config/themeConfig";
import AccommodationModal from "../../components/admin/AccommodationModal";

const AdminAccommodationsPage = () => {
    const navigate = useNavigate();

    const [accommodations, setAccommodations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState(undefined);
    const [selectedProvince, setSelectedProvince] = useState(undefined);
    const [districts, setDistricts] = useState([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState(undefined);
    const [sortBy, setSortBy] = useState(undefined);
    const [provinces, setProvinces] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ACTIVE"); // Mặc định là không khóa

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const loadProvinces = async () => {
        try {
            const data = await getAllProvinceNames();
            setProvinces(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Lỗi lấy tỉnh thành:", error);
        }
    };

    const fetchAccommodations = useCallback(
        async (customPage, customSize) => {
            try {
                setIsLoading(true);
                const targetPage = customPage !== undefined ? customPage : currentPage;
                const targetSize = customSize !== undefined ? customSize : pageSize;
                const apiPage = Math.max(0, targetPage - 1);

                let response;
                const incDel = statusFilter === "ALL" || statusFilter === "LOCKED";

                if (searchTerm && searchTerm.trim()) {
                    response = await searchAccommodations({
                        keyword: searchTerm.trim(),
                        page: apiPage,
                        size: targetSize,
                    });
                } else {
                    response = await getAllAccommodations({
                        page: apiPage,
                        size: targetSize,
                        type: selectedType || undefined,
                        locationId: selectedLocationId || undefined,
                        sortBy: sortBy !== undefined ? sortBy : undefined,
                        includeDeleted: incDel,
                    });
                }

                let data = response?.data || response || [];
                if (!Array.isArray(data)) data = [];

                // Áp dụng bộ lọc trạng thái
                if (statusFilter === "ACTIVE") {
                    data = data.filter((item) => !item.isDeleted);
                } else if (statusFilter === "LOCKED") {
                    data = data.filter((item) => item.isDeleted === true);
                }

                setAccommodations(data);
            } catch (error) {
                console.error("Lỗi tải danh sách cơ sở lưu trú:", error);
                notification.error({
                    message: "Không thể tải danh sách khách sạn",
                    description: error?.message || "Đã xảy ra lỗi khi kết nối tới máy chủ.",
                });
            } finally {
                setIsLoading(false);
            }
        },
        [currentPage, pageSize, searchTerm, selectedType, selectedLocationId, sortBy, statusFilter]
    );

    useEffect(() => {
        loadProvinces();
    }, []);

    useEffect(() => {
        fetchAccommodations();
    }, [fetchAccommodations]);

    const handleProvinceChange = async (province) => {
        setSelectedProvince(province);
        setSelectedLocationId(undefined);
        setCurrentPage(1);

        if (province) {
            try {
                setIsLoadingDistricts(true);
                const data = await getDistrictsByProvinceName(province);
                const list = Array.isArray(data) ? data : data?.data || [];
                setDistricts(list);
            } catch (error) {
                console.error("Lỗi tải quận huyện:", error);
                setDistricts([]);
            } finally {
                setIsLoadingDistricts(false);
            }
        } else {
            setDistricts([]);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedType(undefined);
        setSelectedProvince(undefined);
        setDistricts([]);
        setSelectedLocationId(undefined);
        setSortBy(undefined);
        setStatusFilter("ACTIVE");
        setCurrentPage(1);
    };

    const handleToggleLock = async (record) => {
        try {
            setIsLoading(true);
            if (record.isDeleted) {
                await restoreAccommodation(record.accommodationId);
                notification.success({
                    message: "Khôi phục thành công",
                    description: `Đã mở khóa và khôi phục hoạt động cho "${record.accommodationName}".`,
                });
            } else {
                await deleteAccommodation(record.accommodationId);
                notification.success({
                    message: "Khóa thành công",
                    description: `Đã khóa cơ sở lưu trú "${record.accommodationName}".`,
                });
            }
            fetchAccommodations();
        } catch (error) {
            console.error("Lỗi thay đổi trạng thái khóa/mở khóa:", error);
            notification.error({
                message: "Thao tác thất bại",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể thay đổi trạng thái cơ sở lưu trú.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleViewDetail = (id) => {
        navigate(`/admin/accommodations/${id}`);
    };

    const columns = [
        {
            title: "Ảnh bìa",
            dataIndex: "image",
            key: "image",
            width: 90,
            render: (img) => (
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {img ? (
                        <Image
                            src={img}
                            alt="Hotel"
                            className="w-full h-full object-cover"
                            fallback="https://placehold.co/100x80?text=No+Image"
                        />
                    ) : (
                        <HomeOutlined className="text-slate-400 text-xl" />
                    )}
                </div>
            ),
        },
        {
            title: "Cơ sở lưu trú",
            dataIndex: "accommodationName",
            key: "accommodationName",
            render: (name, record) => {
                const typeConfig = ACCOMMODATION_TYPE_CONFIG[record.type];
                return (
                    <div className="flex flex-col">
                        <span
                            className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                            onClick={() => handleViewDetail(record.accommodationId)}
                        >
                            {name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <Tag color={typeConfig?.tagColor || "blue"} className="mr-0 text-xs">
                                {typeConfig?.label || record.type}
                            </Tag>
                            {record.isDeleted ? (
                                <Tag color="error" className="mr-0 text-xs font-medium">
                                    Đã khóa
                                </Tag>
                            ) : (
                                <Tag color="success" className="mr-0 text-xs font-medium">
                                    Hoạt động
                                </Tag>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Địa chỉ & Thành phố",
            key: "location",
            render: (_, record) => (
                <div className="flex flex-col text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{record.city || "Chưa cập nhật"}</span>
                    <span className="text-slate-500 truncate max-w-xs">{record.address}</span>
                </div>
            ),
        },
        {
            title: "Tọa độ GPS",
            key: "coordinates",
            width: 140,
            render: (_, record) => {
                const lat = record.latitude || record.lat;
                const lng = record.longitude || record.lng;
                return lat && lng ? (
                    <Tooltip title={`Vĩ độ: ${lat} | Kinh độ: ${lng}`}>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono w-max">
                            <EnvironmentOutlined />
                            {Number(lat).toFixed(3)}, {Number(lng).toFixed(3)}
                        </span>
                    </Tooltip>
                ) : (
                    <span className="text-xs text-slate-400 italic">Chưa ghim</span>
                );
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 130,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết & giám sát hoạt động">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-blue-600 text-base" />}
                            onClick={() => handleViewDetail(record.accommodationId)}
                        />
                    </Tooltip>

                    {record.isDeleted ? (
                        <Tooltip title="Mở khóa / Khôi phục cơ sở lưu trú">
                            <Popconfirm
                                title="Mở khóa cơ sở lưu trú"
                                description={`Khôi phục hoạt động cho "${record.accommodationName}"?`}
                                onConfirm={() => handleToggleLock(record)}
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
                        <Tooltip title="Khóa cơ sở lưu trú (Xóa mềm)">
                            <Popconfirm
                                title="Khóa cơ sở lưu trú"
                                description={`Bạn có chắc muốn khóa/ngừng hoạt động cơ sở lưu trú "${record.accommodationName}" không?`}
                                onConfirm={() => handleToggleLock(record)}
                                okText="Khóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button type="text" danger icon={<LockOutlined className="text-base" />} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Trị Cơ Sở Lưu Trú</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Quản lý toàn bộ danh sách khách sạn, resort, homestay và căn hộ trên sàn.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button icon={<ReloadOutlined />} onClick={handleResetFilters} loading={isLoading}>
                        Làm mới
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} size="middle">
                        Thêm Khách Sạn Mới
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                    <div className="lg:col-span-2">
                        <Input
                            placeholder="Tìm theo tên cơ sở lưu trú..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onPressEnter={() => {
                                setCurrentPage(1);
                                fetchAccommodations(1);
                            }}
                            allowClear
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Loại hình"
                            allowClear
                            className="w-full"
                            value={selectedType}
                            onChange={(val) => {
                                setSelectedType(val);
                                setCurrentPage(1);
                            }}
                            options={Object.values(ACCOMMODATION_TYPE_CONFIG).map((item) => ({
                                value: item.value,
                                label: item.label,
                            }))}
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Tỉnh / Thành phố"
                            allowClear
                            showSearch
                            className="w-full"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            options={provinces.map((p) => ({ value: p, label: p }))}
                        />
                    </div>

                    <div>
                        <Select
                            placeholder={isLoadingDistricts ? "Đang tải..." : "Quận / Huyện"}
                            allowClear
                            showSearch
                            disabled={!selectedProvince || isLoadingDistricts}
                            className="w-full"
                            value={selectedLocationId}
                            onChange={(val) => {
                                setSelectedLocationId(val);
                                setCurrentPage(1);
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={districts.map((d) => ({
                                value: d.locationId,
                                label: d.districtName,
                            }))}
                        />
                    </div>

                    <div>
                        <Select
                            placeholder="Sắp xếp"
                            allowClear
                            className="w-full"
                            value={sortBy}
                            onChange={(val) => {
                                setSortBy(val);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: true, label: "Ưu tiên" },
                                { value: false, label: "Mặc định" },
                            ]}
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
                            options={[
                                { value: "ACTIVE", label: "Không khóa" },
                                { value: "LOCKED", label: "Bị khóa" },
                                { value: "ALL", label: "Toàn bộ" },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Data Table: Render trực tiếp accommodations từ API */}
            <Table
                rowKey="accommodationId"
                columns={columns}
                dataSource={accommodations}
                loading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total:
                        accommodations.length < pageSize
                            ? (currentPage - 1) * pageSize + accommodations.length
                            : (currentPage + 1) * pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total) =>
                        `Trang ${currentPage} | Đang hiển thị ${accommodations.length} cơ sở lưu trú`,
                }}
            />

            {/* Modal Thêm Mới Khách Sạn (Admin Role) */}
            <AccommodationModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchAccommodations()}
            />
        </div>
    );
};

export default AdminAccommodationsPage;
