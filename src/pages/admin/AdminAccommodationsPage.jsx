import { useEffect, useState } from "react";
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
    Rate,
    Empty,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    SearchOutlined,
    HomeOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import {
    getAllAccommodations,
    deleteAccommodation,
    searchAccommodations,
} from "../../services/AccommodationService";
import { getAllProvinceNames } from "../../services/LocationService";
import { ACCOMMODATION_TYPE_CONFIG } from "../../config/themeConfig";
import AccommodationModal from "../../components/admin/AccommodationModal";

const AdminAccommodationsPage = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState(undefined);
    const [selectedProvince, setSelectedProvince] = useState(undefined);
    const [provinces, setProvinces] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        loadProvinces();
        fetchAccommodations();
    }, [selectedType]);

    const loadProvinces = async () => {
        try {
            const data = await getAllProvinceNames();
            setProvinces(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy tỉnh thành:", error);
        }
    };

    const fetchAccommodations = async () => {
        try {
            setIsLoading(true);
            const response = await getAllAccommodations({
                page: 0,
                size: 100, // Load danh sách tổng để lọc và phân trang mượt mà
                type: selectedType,
            });

            const data = response?.data || response || [];
            setAccommodations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải danh sách cơ sở lưu trú:", error);
            notification.error({
                message: "Không thể tải danh sách khách sạn",
                description: error?.message || "Đã xảy ra lỗi khi kết nối tới máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchAccommodations();
            return;
        }

        try {
            setIsLoading(true);
            const response = await searchAccommodations({
                keyword: searchTerm.trim(),
                page: 0,
                size: 100,
            });
            const data = response?.data || response || [];
            setAccommodations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            notification.error({
                message: "Lỗi tìm kiếm",
                description: "Không thể thực hiện tìm kiếm cơ sở lưu trú.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        try {
            setIsLoading(true);
            await deleteAccommodation(id);
            notification.success({
                message: "Xóa thành công",
                description: `Đã xóa cơ sở lưu trú "${name}".`,
            });
            fetchAccommodations();
        } catch (error) {
            console.error("Lỗi xóa cơ sở lưu trú:", error);
            notification.error({
                message: "Xóa thất bại",
                description: error?.message || "Không thể xóa cơ sở lưu trú này.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setSelectedAccommodation(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setSelectedAccommodation(record);
        setIsModalOpen(true);
    };

    // Filter dữ liệu client theo tỉnh nếu chọn
    const filteredAccommodations = accommodations.filter((item) => {
        if (selectedProvince && item.city !== selectedProvince) {
            return false;
        }
        if (selectedType && item.type !== selectedType) {
            return false;
        }
        return true;
    });

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
                        <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                            {name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <Tag color={typeConfig?.tagColor || "blue"} className="mr-0 text-xs">
                                {typeConfig?.label || record.type}
                            </Tag>
                            {record.starRating > 0 && (
                                <span className="text-xs text-amber-500 font-semibold flex items-center gap-0.5">
                                    ⭐ {record.starRating}
                                </span>
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
            render: (_, record) => (
                record.latitude && record.longitude ? (
                    <Tooltip title={`Vĩ độ: ${record.latitude} | Kinh độ: ${record.longitude}`}>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                            <EnvironmentOutlined />
                            {Number(record.latitude).toFixed(3)}, {Number(record.longitude).toFixed(3)}
                        </span>
                    </Tooltip>
                ) : (
                    <span className="text-xs text-slate-400 italic">Chưa ghim</span>
                )
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 130,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa thông tin">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-blue-600" />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa cơ sở lưu trú">
                        <Popconfirm
                            title="Xác nhận xóa khách sạn"
                            description={`Bạn có chắc chắn muốn xóa "${record.accommodationName}" không? Hành động này không thể hoàn tác.`}
                            onConfirm={() => handleDelete(record.accommodationId, record.accommodationName)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Trị Cơ Sở Lưu Trú</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Quản lý toàn bộ danh sách khách sạn, resort, homestay và căn hộ trên sàn.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button icon={<ReloadOutlined />} onClick={fetchAccommodations} loading={isLoading}>
                        Làm mới
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} size="middle">
                        Thêm Khách Sạn Mới
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                        placeholder="Tìm theo tên cơ sở lưu trú..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        allowClear
                    />

                    <Select
                        placeholder="Lọc theo loại hình"
                        allowClear
                        value={selectedType}
                        onChange={(val) => setSelectedType(val)}
                        options={Object.values(ACCOMMODATION_TYPE_CONFIG).map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                    />

                    <Select
                        placeholder="Lọc theo Tỉnh/Thành"
                        allowClear
                        showSearch
                        value={selectedProvince}
                        onChange={(val) => setSelectedProvince(val)}
                        options={provinces.map((p) => ({ value: p, label: p }))}
                    />

                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                </div>
            </Card>

            {/* Data Table */}
            <Table
                rowKey="accommodationId"
                columns={columns}
                dataSource={filteredAccommodations}
                loading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredAccommodations.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total) => `Tổng cộng ${total} cơ sở lưu trú`,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="space-y-2 py-4">
                                    <p className="text-slate-500 font-medium">Chưa có cơ sở lưu trú nào phù hợp.</p>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                                        Tạo Khách Sạn Đầu Tiên
                                    </Button>
                                </div>
                            }
                        />
                    ),
                }}
            />

            {/* Modal Thêm & Sửa Khách Sạn */}
            <AccommodationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAccommodations}
                initialData={selectedAccommodation}
            />
        </div>
    );
};

export default AdminAccommodationsPage;
