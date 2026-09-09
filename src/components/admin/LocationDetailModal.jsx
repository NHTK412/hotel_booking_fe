import { useState, useEffect } from "react";
import { Modal, Button, Tag, Space, Typography, notification, Spin, Tooltip } from "antd";
import {
    EnvironmentOutlined,
    CopyOutlined,
    GlobalOutlined,
    CheckOutlined,
    CompassOutlined,
    ReloadOutlined,
    NumberOutlined,
} from "@ant-design/icons";
import LeafletLocationPicker from "../common/LeafletLocationPicker";
import { calculateGeoHash } from "../../services/LocationService";

const { Text } = Typography;

const LocationDetailModal = ({ open, onClose, location }) => {
    const [currentLat, setCurrentLat] = useState(10.7769);
    const [currentLng, setCurrentLng] = useState(106.7009);
    const [geohash, setGeohash] = useState("");
    const [isLoadingGeohash, setIsLoadingGeohash] = useState(false);
    const [isCopiedCoords, setIsCopiedCoords] = useState(false);
    const [isCopiedGeohash, setIsCopiedGeohash] = useState(false);

    useEffect(() => {
        if (location) {
            const lat = Number(location.latitude) || 10.7769;
            const lng = Number(location.longitude) || 106.7009;
            setCurrentLat(lat);
            setCurrentLng(lng);
            fetchGeohash(lat, lng);
        }
    }, [location]);

    const fetchGeohash = async (lat, lng) => {
        try {
            setIsLoadingGeohash(true);
            const res = await calculateGeoHash(lat, lng);
            const hash = typeof res === "string" ? res : res?.data || "";
            setGeohash(hash);
        } catch (error) {
            console.error("Lỗi lấy mã GeoHash:", error);
            setGeohash("—");
        } finally {
            setIsLoadingGeohash(false);
        }
    };

    const handleMapLocationChange = ({ latitude, longitude }) => {
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        fetchGeohash(latitude, longitude);
    };

    const handleResetToDefault = () => {
        if (location) {
            const lat = Number(location.latitude) || 10.7769;
            const lng = Number(location.longitude) || 106.7009;
            setCurrentLat(lat);
            setCurrentLng(lng);
            fetchGeohash(lat, lng);
        }
    };

    const handleCopyCoords = () => {
        const text = `${currentLat}, ${currentLng}`;
        navigator.clipboard.writeText(text);
        setIsCopiedCoords(true);
        notification.success({
            message: "Đã sao chép tọa độ",
            description: text,
            duration: 2,
        });
        setTimeout(() => setIsCopiedCoords(false), 2000);
    };

    const handleCopyGeohash = () => {
        if (!geohash) return;
        navigator.clipboard.writeText(geohash);
        setIsCopiedGeohash(true);
        notification.success({
            message: "Đã sao chép mã GeoHash",
            description: geohash,
            duration: 2,
        });
        setTimeout(() => setIsCopiedGeohash(false), 2000);
    };

    const handleOpenGoogleMaps = () => {
        window.open(`https://www.google.com/maps?q=${currentLat},${currentLng}`, "_blank");
    };

    if (!location) return null;

    const originalLat = Number(location.latitude) || 10.7769;
    const originalLng = Number(location.longitude) || 106.7009;
    const isShifted = Math.abs(currentLat - originalLat) > 0.0001 || Math.abs(currentLng - originalLng) > 0.0001;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <EnvironmentOutlined className="text-base" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 m-0">
                            {location.districtName}, {location.provinceName}
                        </h2>
                        <p className="text-xs text-slate-500 m-0">
                            Chi tiết địa bàn hành chính, tọa độ GPS và tính toán không gian GeoHash
                        </p>
                    </div>
                </div>
            }
            footer={[
                <Button key="close" type="primary" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            width={760}
            centered
            destroyOnClose
        >
            <div className="space-y-4 pt-2">
                {/* Thông tin hành chính dạng thẻ tóm tắt */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div>
                        <span className="text-xs text-slate-400 block mb-0.5">Mã Địa Bàn:</span>
                        <Tag color="blue" className="font-mono font-semibold text-xs px-2 py-0.5 m-0">
                            #{location.locationId}
                        </Tag>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block mb-0.5">Tỉnh / Thành Phố:</span>
                        <span className="text-sm font-semibold text-slate-800">{location.provinceName}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block mb-0.5">Quận / Huyện:</span>
                        <span className="text-sm font-semibold text-slate-800">{location.districtName}</span>
                    </div>

                    <div className="sm:col-span-3 border-t border-slate-200/60 pt-2.5">
                        <span className="text-xs text-slate-400 block mb-0.5">Chuỗi Tìm Kiếm Chuẩn Hóa (Search Vector):</span>
                        <span className="text-xs font-medium text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block w-full">
                            {location.searchVector || `${location.districtName}, ${location.provinceName}`}
                        </span>
                    </div>
                </div>

                {/* Box Tọa độ & GeoHash */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tọa độ GPS */}
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-900 flex items-center gap-1.5">
                                    <CompassOutlined className="text-blue-600" /> Tọa Độ GPS Hiện Tại
                                </span>
                                {isShifted && (
                                    <Tag color="warning" className="m-0 text-[10px]">
                                        Đã dịch chuyển
                                    </Tag>
                                )}
                            </div>
                            <div className="mt-1.5 font-mono text-sm font-semibold text-blue-700">
                                {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100">
                            <Tooltip title="Sao chép cặp tọa độ (Vĩ độ, Kinh độ)">
                                <Button
                                    size="small"
                                    icon={isCopiedCoords ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                                    onClick={handleCopyCoords}
                                    className="text-xs"
                                >
                                    {isCopiedCoords ? "Đã chép" : "Chép tọa độ"}
                                </Button>
                            </Tooltip>
                            <Button
                                size="small"
                                icon={<GlobalOutlined />}
                                onClick={handleOpenGoogleMaps}
                                className="text-xs text-blue-600"
                            >
                                Google Maps
                            </Button>
                            {isShifted && (
                                <Tooltip title="Quay về tọa độ trung tâm ban đầu">
                                    <Button
                                        size="small"
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetToDefault}
                                        className="text-xs"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Mã GeoHash */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-emerald-900 flex items-center gap-1.5">
                                    <NumberOutlined className="text-emerald-600" /> Mã Không Gian GeoHash (12 Ký Tự)
                                </span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    Spatial Index
                                </span>
                            </div>
                            <div className="mt-1.5 font-mono text-sm font-bold text-emerald-800 tracking-wider">
                                {isLoadingGeohash ? (
                                    <Spin size="small" />
                                ) : (
                                    geohash || "Chưa có mã"
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-100">
                            <Tooltip title="Sao chép mã GeoHash">
                                <Button
                                    size="small"
                                    icon={isCopiedGeohash ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                                    onClick={handleCopyGeohash}
                                    disabled={!geohash || isLoadingGeohash}
                                    className="text-xs"
                                >
                                    {isCopiedGeohash ? "Đã chép" : "Chép GeoHash"}
                                </Button>
                            </Tooltip>
                            <span className="text-[11px] text-slate-500 italic">
                                Thuật toán Geohash backend
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bản đồ Leaflet Map */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <EnvironmentOutlined className="text-blue-600" /> Bản Đồ Định Vị Trực Quan
                        </span>
                        <span className="text-[11px] text-slate-400">
                            Nhấp chuột lên bản đồ để thử nghiệm tính GeoHash tại vị trí mới
                        </span>
                    </div>
                    <LeafletLocationPicker
                        latitude={currentLat}
                        longitude={currentLng}
                        onChange={handleMapLocationChange}
                        height="320px"
                        label={`${location.districtName}, ${location.provinceName}`}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default LocationDetailModal;
