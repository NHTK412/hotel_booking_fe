import { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Upload,
    Row,
    Col,
    notification,
    Image,
    InputNumber,
    Tag,
} from "antd";
import {
    UploadOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    PictureOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import LeafletLocationPicker from "../common/LeafletLocationPicker";
import {
    createAccommodation,
} from "../../services/AccommodationService";
import { getAllProvinceNames, getDistrictsByProvinceName } from "../../services/LocationService";
import { uploadFile } from "../../services/UploadFileService";
import { ACCOMMODATION_TYPE_CONFIG } from "../../config/themeConfig";

const { TextArea } = Input;

const accommodationTypeOptions = Object.values(ACCOMMODATION_TYPE_CONFIG).map((item) => ({
    value: item.value,
    label: item.label,
}));

const AccommodationModal = ({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const watchedProvince = Form.useWatch("province", form);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [coords, setCoords] = useState({ lat: 10.7769, lng: 106.7009 });

    useEffect(() => {
        if (open) {
            loadProvinces();
            form.resetFields();
            form.setFieldsValue({
                type: "HOTEL",
                latitude: 10.7769,
                longitude: 106.7009,
            });
            setImageUrl("");
            setDistricts([]);
            setCoords({ lat: 10.7769, lng: 106.7009 });
        }
    }, [open]);

    const loadProvinces = async () => {
        try {
            const data = await getAllProvinceNames();
            const list = Array.isArray(data) ? data : data?.data || [];
            setProvinces(list);
        } catch (error) {
            console.error("Lỗi lấy danh sách tỉnh thành:", error);
        }
    };

    const loadDistricts = async (provinceName) => {
        try {
            setIsLoadingDistricts(true);
            const data = await getDistrictsByProvinceName(provinceName);
            const list = Array.isArray(data) ? data : data?.data || [];
            setDistricts(list);
        } catch (error) {
            console.error("Lỗi tải danh sách quận huyện:", error);
        } finally {
            setIsLoadingDistricts(false);
        }
    };

    const handleProvinceChange = async (province) => {
        form.setFieldsValue({ district: undefined, locationId: undefined });
        await loadDistricts(province);
    };

    const handleDistrictChange = (locId) => {
        const numLocId = Number(locId);
        const found = districts.find((d) => d.locationId === numLocId);
        form.setFieldsValue({
            locationId: numLocId,
            district: numLocId,
        });

        if (found?.latitude && found?.longitude) {
            const newCoords = { lat: Number(found.latitude), lng: Number(found.longitude) };
            setCoords(newCoords);
            form.setFieldsValue({
                latitude: newCoords.lat,
                longitude: newCoords.lng,
            });
        }
    };

    const handleMapLocationSelect = ({ lat, lng }) => {
        setCoords({ lat, lng });
        form.setFieldsValue({
            latitude: lat,
            longitude: lng,
        });
    };

    const handleUploadImage = async (file) => {
        try {
            setIsUploading(true);
            const response = await uploadFile(file);
            // Backend trả về { success: true, data: { fileName: "...", filePath: "https://..." } }
            const url =
                response?.filePath ||
                response?.data?.filePath ||
                response?.url ||
                response?.data?.url ||
                (typeof response === "string" ? response : "");

            if (url) {
                setImageUrl(url);
                form.setFieldsValue({ image: url });
                notification.success({
                    message: "Tải ảnh thành công",
                    description: "Ảnh bìa đã được lưu trữ trên Cloudinary CDN.",
                });
            } else {
                console.warn("Không tìm thấy đường dẫn ảnh trong response:", response);
                notification.warning({
                    message: "Không tìm thấy URL ảnh",
                    description: "Tệp đã tải lên nhưng phản hồi máy chủ không chứa filePath.",
                });
            }
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            notification.error({
                message: "Tải ảnh thất bại",
                description: error?.message || "Không thể tải ảnh lên máy chủ.",
            });
        } finally {
            setIsUploading(false);
        }
        return false; // Ngăn Ant Design tự động gửi form
    };

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);
            const payload = {
                accommodationName: values.accommodationName.trim(),
                description: values.description?.trim() || "",
                address: values.address.trim(),
                city: values.province || "",
                latitude: values.latitude ? Number(values.latitude) : coords.lat,
                longitude: values.longitude ? Number(values.longitude) : coords.lng,
                image: imageUrl || values.image || "",
                type: values.type,
                locationId: Number(values.locationId || values.district),
            };

            await createAccommodation(payload);
            notification.success({
                message: "Tạo mới thành công",
                description: `Đã thêm mới cơ sở lưu trú "${payload.accommodationName}".`,
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi lưu cơ sở lưu trú:", error);
            notification.error({
                message: "Tạo mới thất bại",
                description:
                    error?.message ||
                    error?.response?.data?.message ||
                    "Đã xảy ra lỗi trong quá trình lưu thông tin.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-slate-800 text-lg font-bold pb-2 border-b border-slate-100">
                    <HomeOutlined className="text-blue-600" />
                    <span>Thêm Mới Cơ Sở Lưu Trú</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={960}
            footer={null}
            destroyOnClose
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                className="mt-4"
            >
                <Row gutter={[24, 0]}>
                    {/* Cột Trái: Thông tin cơ bản & Upload */}
                    <Col xs={24} md={13}>
                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Tên cơ sở lưu trú</span>}
                            name="accommodationName"
                            rules={[{ required: true, message: "Vui lòng nhập tên khách sạn / chỗ nghỉ!" }]}
                        >
                            <Input placeholder="Ví dụ: Grand Saigon Riverside Hotel" size="large" />
                        </Form.Item>

                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span className="font-semibold text-slate-700">Loại hình</span>}
                                    name="type"
                                    rules={[{ required: true, message: "Vui lòng chọn loại hình!" }]}
                                >
                                    <Select options={accommodationTypeOptions} size="large" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label={<span className="font-semibold text-slate-700">Tỉnh / Thành phố</span>}
                                    name="province"
                                    rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành!" }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn Tỉnh/Thành"
                                        size="large"
                                        onChange={handleProvinceChange}
                                        options={provinces.map((p) => ({ value: p, label: p }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item
                                    label={<span className="font-semibold text-slate-700">Quận / Huyện</span>}
                                    name="district"
                                    rules={[{ required: true, message: "Vui lòng chọn Quận/Huyện!" }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder={isLoadingDistricts ? "Đang tải danh sách..." : "Chọn Quận/Huyện"}
                                        size="large"
                                        disabled={!watchedProvince || isLoadingDistricts}
                                        onChange={handleDistrictChange}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={districts.map((d) => ({
                                            value: d.locationId,
                                            label: d.districtName,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Location ID được lưu ngầm tự động để gửi API */}
                        <Form.Item name="locationId" hidden>
                            <InputNumber />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Địa chỉ cụ thể</span>}
                            name="address"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể!" }]}
                        >
                            <Input placeholder="Số nhà, tên đường, khu phố..." size="large" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Ảnh đại diện (Cloudinary CDN)</span>}
                            name="image"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-28 h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                    {isUploading ? (
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                                    ) : imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            height={80}
                                        />
                                    ) : (
                                        <PictureOutlined className="text-slate-300 text-3xl" />
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Upload
                                            beforeUpload={handleUploadImage}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined />} loading={isUploading}>
                                                {isUploading ? "Đang tải lên CDN..." : "Tải ảnh từ máy tính"}
                                            </Button>
                                        </Upload>
                                        {imageUrl && (
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                onClick={() => {
                                                    setImageUrl("");
                                                    form.setFieldsValue({ image: "" });
                                                }}
                                            >
                                                Xóa ảnh
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="Hoặc dán URL ảnh trực tiếp"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            setImageUrl(e.target.value);
                                            form.setFieldsValue({ image: e.target.value });
                                        }}
                                        size="small"
                                        hidden={true}
                                    />
                                    {imageUrl && (
                                        <span className="text-[11px] text-emerald-600 truncate max-w-sm">
                                            ✓ Tải ảnh thành công lên Cloudinary CDN
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Mô tả tổng quan</span>}
                            name="description"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Giới thiệu về tiện nghi, phong cách phục vụ, không gian..."
                            />
                        </Form.Item>
                    </Col>

                    {/* Cột Phải: Định vị & Bản đồ Leaflet */}
                    <Col xs={24} md={11} className="flex flex-col">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <EnvironmentOutlined className="text-blue-600" />
                                Định vị tọa độ Geocoding
                            </span>
                            <span className="text-xs text-slate-500">Kinh độ / Vĩ độ</span>
                        </div>

                        <LeafletLocationPicker
                            latitude={coords.lat}
                            longitude={coords.lng}
                            onChange={handleMapLocationSelect}
                            height="340px"
                            label={form.getFieldValue("accommodationName") || "Vị trí khách sạn"}
                        />

                        <Row gutter={8} className="mt-3">
                            <Col span={12}>
                                <Form.Item
                                    label={<span className="text-xs text-slate-600">Vĩ độ (Latitude)</span>}
                                    name="latitude"
                                >
                                    <InputNumber
                                        className="w-full"
                                        step={0.0001}
                                        onChange={(val) => {
                                            if (val !== null) setCoords((prev) => ({ ...prev, lat: Number(val) }));
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span className="text-xs text-slate-600">Kinh độ (Longitude)</span>}
                                    name="longitude"
                                >
                                    <InputNumber
                                        className="w-full"
                                        step={0.0001}
                                        onChange={(val) => {
                                            if (val !== null) setCoords((prev) => ({ ...prev, lng: Number(val) }));
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isSubmitting} className="px-6">
                        Tạo Cơ Sở Lưu Trú
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AccommodationModal;
