import { useState, useEffect, useCallback } from "react";
import {
    Table,
    Button,
    Input,
    Select,
    Card,
    Tag,
    Space,
    Tooltip,
    notification,
    Typography,
} from "antd";
import {
    ReloadOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    GlobalOutlined,
    CopyOutlined,
    CheckCircleOutlined,
    CalculatorOutlined,
    CompassOutlined,
} from "@ant-design/icons";
import {
    getAllProvinceNames,
    getDistrictsByProvinceName,
    searchLocations,
    getAllLocations,
} from "../../services/LocationService";
import LocationDetailModal from "../../components/admin/LocationDetailModal";
import GeohashCalculatorModal from "../../components/admin/GeohashCalculatorModal";

const { Text } = Typography;

const AdminLocationsPage = () => {
    // Dữ liệu
    const [locations, setLocations] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districtsInProvince, setDistrictsInProvince] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvince, setSelectedProvince] = useState(undefined);
    const [selectedDistrict, setSelectedDistrict] = useState(undefined);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

    // 1. Tải danh sách tỉnh thành ban đầu
    const loadProvinces = async () => {
        try {
            const data = await getAllProvinceNames();
            const list = Array.isArray(data) ? data : data?.data || [];
            setProvinces(list);
        } catch (error) {
            console.error("Lỗi lấy danh sách tỉnh thành:", error);
        }
    };

    // 2. Tải dữ liệu địa điểm chính
    const fetchLocations = useCallback(async () => {
        try {
            setIsLoading(true);

            // Trường hợp 1: Có từ khóa tìm kiếm
            if (searchTerm && searchTerm.trim()) {
                const res = await searchLocations(searchTerm.trim(), 0, 100);
                const data = Array.isArray(res) ? res : res?.data || [];
                setLocations(data);
                return;
            }

            // Trường hợp 2: Có chọn Tỉnh/Thành phố
            if (selectedProvince) {
                const res = await getDistrictsByProvinceName(selectedProvince);
                let list = Array.isArray(res) ? res : res?.data || [];
                // Nếu có chọn quận/huyện cụ thể
                if (selectedDistrict) {
                    list = list.filter(
                        (item) => item.districtName?.toLowerCase() === selectedDistrict.toLowerCase()
                    );
                }
                setLocations(list);
                return;
            }

            // Trường hợp 3: Tải toàn bộ danh sách địa điểm
            const allRes = await getAllLocations();
            const allList = Array.isArray(allRes) ? allRes : allRes?.data || [];
            setLocations(allList);
        } catch (error) {
            console.error("Lỗi tải danh mục địa điểm:", error);
            notification.error({
                message: "Không thể tải danh sách địa bàn",
                description: error?.message || "Đã xảy ra lỗi khi kết nối tới máy chủ.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, selectedProvince, selectedDistrict]);

    // Khi chọn tỉnh thành thì nạp quận/huyện tương ứng
    const handleProvinceChange = async (province) => {
        setSelectedProvince(province);
        setSelectedDistrict(undefined);
        setCurrentPage(1);

        if (province) {
            try {
                const res = await getDistrictsByProvinceName(province);
                const list = Array.isArray(res) ? res : res?.data || [];
                setDistrictsInProvince(list);
            } catch (error) {
                console.error("Lỗi tải quận huyện theo tỉnh:", error);
                setDistrictsInProvince([]);
            }
        } else {
            setDistrictsInProvince([]);
        }
    };

    const handleDistrictChange = (district) => {
        setSelectedDistrict(district);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedProvince(undefined);
        setSelectedDistrict(undefined);
        setDistrictsInProvince([]);
        setCurrentPage(1);
    };

    useEffect(() => {
        loadProvinces();
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleOpenDetail = (record) => {
        setSelectedLocation(record);
        setIsDetailModalOpen(true);
    };

    const handleCopyCoords = (lat, lng) => {
        const text = `${lat}, ${lng}`;
        navigator.clipboard.writeText(text);
        notification.success({
            message: "Đã sao chép tọa độ",
            description: text,
            duration: 2,
        });
    };

    // Định nghĩa các cột bảng dữ liệu
    const columns = [
        {
            title: "ID",
            dataIndex: "locationId",
            key: "locationId",
            width: 75,
            align: "center",
            render: (id) => (
                <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                    #{id}
                </span>
            ),
        },
        {
            title: "Tỉnh / Thành phố",
            dataIndex: "provinceName",
            key: "provinceName",
            width: 170,
            render: (name) => (
                <div className="flex items-center gap-1.5">
                    <GlobalOutlined className="text-blue-500 text-xs" />
                    <span className="font-medium text-slate-800 text-xs">{name}</span>
                </div>
            ),
        },
        {
            title: "Quận / Huyện",
            dataIndex: "districtName",
            key: "districtName",
            width: 190,
            render: (name, record) => (
                <span
                    className="font-bold text-slate-800 text-xs hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => handleOpenDetail(record)}
                >
                    {name}
                </span>
            ),
        },
        {
            title: "Tọa độ GPS (Vĩ độ, Kinh độ)",
            key: "coordinates",
            width: 190,
            render: (_, record) => {
                const lat = Number(record.latitude);
                const lng = Number(record.longitude);
                return lat && lng ? (
                    <Tooltip title="Click để xem vị trí trên bản đồ">
                        <span
                            className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-mono cursor-pointer transition-colors"
                            onClick={() => handleOpenDetail(record)}
                        >
                            <EnvironmentOutlined />
                            {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                    </Tooltip>
                ) : (
                    <span className="text-xs text-slate-400 italic">Chưa có tọa độ</span>
                );
            },
        },
        {
            title: "Chuỗi tìm kiếm (Search Vector)",
            dataIndex: "searchVector",
            key: "searchVector",
            width: 250,
            render: (vector, record) => {
                const text = vector || `${record.districtName}, ${record.provinceName}`;
                return (
                    <Tooltip title={text}>
                        <span className="text-slate-600 text-xs truncate max-w-xs block font-mono">
                            {text}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 110,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem bản đồ số & tính mã GeoHash">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-blue-600 text-base" />}
                            onClick={() => handleOpenDetail(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Sao chép tọa độ">
                        <Button
                            type="text"
                            icon={<CopyOutlined className="text-slate-500 hover:text-slate-700 text-base" />}
                            onClick={() => handleCopyCoords(record.latitude, record.longitude)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Trang */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản Lý Địa Bàn & Bản Đồ Số</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Tra cứu danh mục 63 tỉnh/thành phố, các quận/huyện, tọa độ địa lý trung tâm và mã hóa không gian Geohash.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        icon={<CalculatorOutlined />}
                        onClick={() => setIsCalculatorModalOpen(true)}
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                        Công cụ GeoHash
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleResetFilters} loading={isLoading}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Thẻ Thống Kê Nhanh (KPI Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500 block">Tổng Số Tỉnh / Thành</span>
                            <span className="text-2xl font-bold text-slate-800 mt-1 block">
                                {provinces.length > 0 ? `${provinces.length} Tỉnh thành` : "63 Tỉnh thành"}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <GlobalOutlined className="text-xl" />
                        </div>
                    </div>
                </Card>

                <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500 block">Số Quận / Huyện Hiện Tại</span>
                            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                                {locations.length} Quận/Huyện
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <EnvironmentOutlined className="text-xl" />
                        </div>
                    </div>
                </Card>

                {/* <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500 block">Chuẩn Hóa Tọa Độ & Geohash</span>
                            <span className="text-2xl font-bold text-blue-600 mt-1 block">
                                100% Đã Ghim GPS
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <CheckCircleOutlined className="text-xl" />
                        </div>
                    </div>
                </Card> */}
            </div>

            {/* Thanh Bộ Lọc & Tìm Kiếm */}
            <Card className="border-slate-200 shadow-xs" bodyStyle={{ padding: "16px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Ô tìm kiếm từ khóa */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Tìm kiếm địa danh:
                        </label>
                        <Input
                            placeholder="Nhập tên quận, tỉnh thành..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            allowClear
                        />
                    </div>

                    {/* Dropdown chọn Tỉnh/Thành */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Tỉnh / Thành phố:
                        </label>
                        <Select
                            placeholder="Tất cả tỉnh thành"
                            showSearch
                            allowClear
                            style={{ width: "100%" }}
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            options={provinces.map((p) => ({ value: p, label: p }))}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </div>

                    {/* Dropdown chọn Quận/Huyện */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Quận / Huyện:
                        </label>
                        <Select
                            placeholder={selectedProvince ? "Tất cả quận/huyện" : "Chọn tỉnh thành trước"}
                            showSearch
                            allowClear
                            disabled={!selectedProvince}
                            style={{ width: "100%" }}
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            options={districtsInProvince.map((d) => ({
                                value: d.districtName,
                                label: d.districtName,
                            }))}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </div>

                    {/* Nút Reset */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleResetFilters}
                            className="w-full text-slate-600 hover:text-slate-800"
                        >
                            Đặt lại bộ lọc
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Bảng Dữ Liệu Ant Design Table */}
            <Table
                rowKey="locationId"
                columns={columns}
                dataSource={locations}
                loading={isLoading}
                scroll={{ x: 1050 }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: locations.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total) =>
                        `Đang hiển thị ${locations.length} địa bàn hành chính`,
                }}
            />

            {/* Modal Chi Tiết Địa Điểm & Bản Đồ */}
            <LocationDetailModal
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                location={selectedLocation}
            />

            {/* Modal Công Cụ Tính GeoHash */}
            <GeohashCalculatorModal
                open={isCalculatorModalOpen}
                onClose={() => setIsCalculatorModalOpen(false)}
            />
        </div>
    );
};

export default AdminLocationsPage;
