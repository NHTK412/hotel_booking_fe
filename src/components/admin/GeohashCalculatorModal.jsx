import { useState } from "react";
import { Modal, InputNumber, Button, Space, Tag, notification, Spin, Alert, Card } from "antd";
import {
    CompassOutlined,
    AimOutlined,
    CopyOutlined,
    CheckOutlined,
    EnvironmentOutlined,
    CalculatorOutlined,
} from "@ant-design/icons";
import LeafletLocationPicker from "../common/LeafletLocationPicker";
import { calculateGeoHash, getCurrentLocation } from "../../services/LocationService";

const GeohashCalculatorModal = ({ open, onClose }) => {
    const [lat, setLat] = useState(10.7769);
    const [lng, setLng] = useState(106.7009);
    const [geohash, setGeohash] = useState("");
    const [matchedLocation, setMatchedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCalculate = async (customLat = lat, customLng = lng) => {
        try {
            setIsLoading(true);
            const resHash = await calculateGeoHash(customLat, customLng);
            const hash = typeof resHash === "string" ? resHash : resHash?.data || "";
            setGeohash(hash);

            // Thử đối chiếu vị trí với API /locations/me
            try {
                const locRes = await getCurrentLocation({ latitude: customLat, longitude: customLng });
                const loc = locRes?.data || locRes;
                if (loc && loc.locationId) {
                    setMatchedLocation(loc);
                } else {
                    setMatchedLocation(null);
                }
            } catch {
                setMatchedLocation(null);
            }
        } catch (error) {
            console.error("Lỗi tính toán GeoHash:", error);
            notification.error({
                message: "Tính toán thất bại",
                description: error?.message || "Không thể tính toán mã GeoHash từ tọa độ này.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            notification.warning({
                message: "Không hỗ trợ Geolocation",
                description: "Trình duyệt của bạn không hỗ trợ lấy tọa độ GPS tự động.",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = Number(pos.coords.latitude.toFixed(6));
                const userLng = Number(pos.coords.longitude.toFixed(6));
                setLat(userLat);
                setLng(userLng);
                setIsLocating(false);
                handleCalculate(userLat, userLng);
                notification.success({
                    message: "Đã lấy tọa độ GPS của bạn",
                    description: `${userLat}, ${userLng}`,
                });
            },
            (err) => {
                setIsLocating(false);
                console.warn("Lỗi lấy GPS:", err);
                notification.info({
                    message: "Không lấy được GPS",
                    description: "Vui lòng cho phép quyền truy cập vị trí trên trình duyệt hoặc nhập thủ công.",
                });
            },
            { timeout: 10000 }
        );
    };

    const handleMapSelect = ({ latitude, longitude }) => {
        setLat(latitude);
        setLng(longitude);
        handleCalculate(latitude, longitude);
    };

    const handleCopyGeohash = () => {
        if (!geohash) return;
        navigator.clipboard.writeText(geohash);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        notification.success({
            message: "Đã sao chép mã GeoHash",
            description: geohash,
            duration: 2,
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CalculatorOutlined className="text-base" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 m-0">
                            Công Cụ Tính Toán Không Gian GeoHash & Kiểm Tra Tọa Độ
                        </h2>
                        <p className="text-xs text-slate-500 m-0">
                            Tính toán mã hóa không gian Geohash 12 ký tự và tra cứu địa danh đối ứng từ Backend
                        </p>
                    </div>
                </div>
            }
            footer={[
                <Button key="close" type="primary" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            width={720}
            centered
            destroyOnClose
        >
            <div className="space-y-4 pt-2">
                {/* Form nhập tọa độ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Vĩ Độ (Latitude):
                        </label>
                        <InputNumber
                            value={lat}
                            onChange={(val) => setLat(val)}
                            step={0.0001}
                            style={{ width: "100%" }}
                            placeholder="Ví dụ: 10.7769"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Kinh Độ (Longitude):
                        </label>
                        <InputNumber
                            value={lng}
                            onChange={(val) => setLng(val)}
                            step={0.0001}
                            style={{ width: "100%" }}
                            placeholder="Ví dụ: 106.7009"
                        />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between pt-1">
                        <Button
                            icon={<AimOutlined />}
                            onClick={handleGetGPS}
                            loading={isLocating}
                            size="middle"
                        >
                            Lấy vị trí GPS của tôi
                        </Button>
                        <Button
                            type="primary"
                            icon={<CalculatorOutlined />}
                            onClick={() => handleCalculate(lat, lng)}
                            loading={isLoading}
                        >
                            Tính Toán GeoHash
                        </Button>
                    </div>
                </div>

                {/* Kết quả tính toán */}
                {geohash && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-xs text-emerald-800 font-semibold block mb-0.5">
                                Mã Không Gian GeoHash (12 Ký tự):
                            </span>
                            <span className="font-mono text-lg font-bold text-emerald-900 tracking-widest">
                                {geohash}
                            </span>
                        </div>
                        <Button
                            icon={isCopied ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                            onClick={handleCopyGeohash}
                            className="bg-white border-emerald-300"
                        >
                            {isCopied ? "Đã sao chép" : "Sao chép mã"}
                        </Button>
                    </div>
                )}

                {/* Địa phương tương ứng nếu nhận diện được */}
                {matchedLocation && (
                    <Alert
                        type="info"
                        showIcon
                        icon={<EnvironmentOutlined />}
                        message="Địa bàn đối chiếu trong cơ sở dữ liệu:"
                        description={
                            <div className="text-xs mt-1 text-slate-700">
                                <strong>{matchedLocation.districtName}</strong>,{" "}
                                <strong>{matchedLocation.provinceName}</strong> (Mã: #{matchedLocation.locationId})
                            </div>
                        }
                    />
                )}

                {/* Bản đồ Leaflet tương tác */}
                <div>
                    <div className="text-xs text-slate-500 mb-1">
                        Nhấp chuột lên bản đồ bên dưới để thay đổi tọa độ và tính lại GeoHash:
                    </div>
                    <LeafletLocationPicker
                        latitude={lat}
                        longitude={lng}
                        onChange={handleMapSelect}
                        height="260px"
                        label={`Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default GeohashCalculatorModal;
