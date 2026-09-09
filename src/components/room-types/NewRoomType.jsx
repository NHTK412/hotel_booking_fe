import { useState, useContext } from "react";
import {
    Button,
    Checkbox,
    Input,
    InputNumber,
    Upload,
    Spin,
    notification,
    Row,
    Col,
    Divider,
    Alert,
    Select,
} from "antd";
import {
    UploadOutlined,
    PlusOutlined,
    DollarOutlined,
    WifiOutlined,
    UserOutlined,
    HomeOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { uploadFile, uploadFileMultiple } from "../../services/UploadFileService";
import { createRoomType } from "../../services/RoomService";
import { globalContext } from "../../context/GlobalContext";

const { TextArea } = Input;

const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);
};

const AMENITY_OPTIONS = [
    { label: "WiFi Tốc Độ Cao", value: "WIFI" },
    { label: "Điều Hòa Không Khí", value: "AIR_CONDITIONING" },
    { label: "Smart TV", value: "TV" },
    { label: "Tủ Lạnh / Mini Bar", value: "MINI_BAR" },
    { label: "Dịch Vụ Phòng", value: "ROOM_SERVICE" },
    { label: "Hồ Bơi", value: "SWIMMING_POOL" },
    { label: "Phòng Gym", value: "GYM" },
    { label: "Spa / Massage", value: "SPA" },
    { label: "Bãi Đỗ Xe", value: "PARKING" },
    { label: "Bao Gồm Bữa Sáng", value: "BREAKFAST_INCLUDED" },
];

const NewRoomType = ({ fetchRoomTypes, setIsShowModalNewRoomType }) => {
    const { listHotel, selectedAccommodationId } = useContext(globalContext);

    const [isLoading, setIsLoading] = useState(false);
    const [targetAccommodationId, setTargetAccommodationId] = useState(() => {
        return selectedAccommodationId ? Number(selectedAccommodationId) : (listHotel?.[0]?.accommodationId || null);
    });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(1000000);
    const [discount, setDiscount] = useState(0);
    const [numberOfBedrooms, setNumberOfBedrooms] = useState(1);
    const [maxGuests, setMaxGuests] = useState(2);
    const [mainImage, setMainImage] = useState(null);
    const [otherImages, setOtherImages] = useState([]);
    const [amenities, setAmenities] = useState(["WIFI", "AIR_CONDITIONING"]);

    const handleCreateRoomType = async () => {
        if (!targetAccommodationId) {
            notification.warning({
                message: "Thiếu thông tin",
                description: "Vui lòng chọn cơ sở lưu trú cho loại phòng mới.",
            });
            return;
        }

        if (!name.trim()) {
            notification.warning({
                message: "Thiếu thông tin",
                description: "Vui lòng nhập tên loại phòng.",
            });
            return;
        }

        if (!price || price <= 0) {
            notification.warning({
                message: "Giá phòng không hợp lệ",
                description: "Giá niêm yết phải lớn hơn 0 VNĐ.",
            });
            return;
        }

        if (discount < 0 || discount > 100) {
            notification.warning({
                message: "Giảm giá không hợp lệ",
                description: "Tỷ lệ giảm giá phải từ 0% đến 100%.",
            });
            return;
        }

        if (!mainImage) {
            notification.warning({
                message: "Thiếu ảnh đại diện",
                description: "Vui lòng tải lên ảnh bìa đại diện cho loại phòng.",
            });
            return;
        }

        try {
            setIsLoading(true);

            // 1. Upload ảnh chính
            const uploadMainResponse = await uploadFile(mainImage);
            const mainPath = uploadMainResponse?.data?.filePath || uploadMainResponse?.filePath;

            // 2. Upload các ảnh phụ (nếu có)
            let otherPaths = [];
            if (otherImages.length > 0) {
                const uploadOtherResponses = await uploadFileMultiple(otherImages);
                const rawList = uploadOtherResponses?.data || uploadOtherResponses || [];
                if (Array.isArray(rawList)) {
                    otherPaths = rawList.map((res) => res.filePath || res);
                }
            }

            const payload = {
                name: name.trim(),
                price: Number(price),
                discount: Number(discount) || 0,
                image: mainPath,
                imagesPreview: otherPaths,
                amenities: amenities,
                accommodationId: Number(targetAccommodationId),
                capacity: Number(maxGuests) || 2,
                bedroom: Number(numberOfBedrooms) || 1,
                description: description.trim(),
            };

            await createRoomType(payload);

            notification.success({
                message: "Tạo loại phòng thành công",
                description: `Loại phòng "${name}" đã được bổ sung vào cơ sở lưu trú.`,
            });

            fetchRoomTypes();
            setIsShowModalNewRoomType(false);
        } catch (error) {
            console.error("Lỗi khi tạo loại phòng mới:", error);
            notification.error({
                message: "Tạo loại phòng thất bại",
                description: error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo loại phòng mới.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const finalPrice = Math.max(0, Math.round(price * (1 - (discount || 0) / 100)));

    return (
        <Spin spinning={isLoading} tip="Đang tải ảnh và lưu loại phòng...">
            <div className="space-y-4 py-2">
                {/* Chọn cơ sở lưu trú */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Cơ Sở Lưu Trú Trực Thuộc <span className="text-red-500">*</span>:
                    </label>
                    <Select
                        style={{ width: "100%" }}
                        size="large"
                        placeholder="Chọn cơ sở lưu trú"
                        value={targetAccommodationId || undefined}
                        onChange={(val) => setTargetAccommodationId(val)}
                        options={(listHotel || []).map((hotel) => ({
                            value: hotel.accommodationId,
                            label: (
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">
                                        {hotel.accommodationName}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        #{hotel.accommodationId}
                                    </span>
                                </div>
                            ),
                        }))}
                    />
                </div>

                {/* Tên loại phòng */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Tên Loại Phòng <span className="text-red-500">*</span>:
                    </label>
                    <Input
                        placeholder="Ví dụ: Deluxe King Hướng Biển, Superior Double..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="large"
                    />
                </div>

                {/* Sức chứa & Số phòng ngủ */}
                <Row gutter={16}>
                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Sức Chứa (Khách tối đa):
                        </label>
                        <InputNumber
                            min={1}
                            max={50}
                            value={maxGuests}
                            onChange={(val) => setMaxGuests(Number(val) || 1)}
                            prefix={<UserOutlined className="text-slate-400" />}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Số Phòng Ngủ:
                        </label>
                        <InputNumber
                            min={1}
                            max={20}
                            value={numberOfBedrooms}
                            onChange={(val) => setNumberOfBedrooms(Number(val) || 1)}
                            prefix={<HomeOutlined className="text-slate-400" />}
                            style={{ width: "100%" }}
                        />
                    </Col>
                </Row>

                {/* Giá & Giảm giá */}
                <Row gutter={16}>
                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Giá Niêm Yết (VNĐ/đêm) <span className="text-red-500">*</span>:
                        </label>
                        <InputNumber
                            value={price}
                            onChange={(val) => setPrice(Number(val) || 0)}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                            step={50000}
                            min={0}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Tỷ Lệ Giảm Giá (%):
                        </label>
                        <InputNumber
                            value={discount}
                            onChange={(val) => setDiscount(Number(val) || 0)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            style={{ width: "100%" }}
                        />
                    </Col>
                </Row>

                {/* Hộp xem trước giá thực tế */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-emerald-800 block">
                            Giá Thực Tế Khách Trả (Sau khi giảm giá):
                        </span>
                        <span className="text-xs text-emerald-600">
                            Niêm yết {formatVND(price)} - Giảm {discount || 0}%
                        </span>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">
                        {formatVND(finalPrice)}
                    </span>
                </div>

                {/* Mô tả chi tiết */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Mô Tả Tiện Ích & Không Gian:
                    </label>
                    <TextArea
                        placeholder="Mô tả không gian phòng, tầm nhìn, trang bị đặc biệt..."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Danh mục tiện ích */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                        Tiện Nghi Trong Phòng:
                    </label>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <Checkbox.Group
                            options={AMENITY_OPTIONS}
                            value={amenities}
                            onChange={(vals) => setAmenities(vals)}
                            className="grid grid-cols-2 gap-2 text-xs"
                        />
                    </div>
                </div>

                {/* Upload hình ảnh */}
                <Row gutter={16}>
                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Ảnh Bìa Đại Diện <span className="text-red-500">*</span>:
                        </label>
                        <Upload
                            beforeUpload={(file) => {
                                file.status = "done";
                                return false;
                            }}
                            onChange={({ fileList }) => {
                                setMainImage(fileList[0]?.originFileObj || null);
                            }}
                            listType="picture"
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Chọn Ảnh Bìa</Button>
                        </Upload>
                    </Col>

                    <Col span={12}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Bộ Sưu Tập Ảnh Chi Tiết:
                        </label>
                        <Upload
                            beforeUpload={(file) => {
                                file.status = "done";
                                return false;
                            }}
                            onChange={({ fileList }) => {
                                setOtherImages(fileList.map((f) => f.originFileObj).filter(Boolean));
                            }}
                            listType="picture"
                            multiple
                            maxCount={8}
                        >
                            <Button icon={<UploadOutlined />}>Tải Thêm Ảnh (Tối đa 8)</Button>
                        </Upload>
                    </Col>
                </Row>

                <Divider className="my-2" />

                <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={() => setIsShowModalNewRoomType(false)}>
                        Hủy Bỏ
                    </Button>
                    <Button type="primary" onClick={handleCreateRoomType} loading={isLoading}>
                        Tạo Loại Phòng Mới
                    </Button>
                </div>
            </div>
        </Spin>
    );
};

export default NewRoomType;