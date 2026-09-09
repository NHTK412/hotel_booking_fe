import { useState, useContext } from "react";
import {
    Button,
    Checkbox,
    Input,
    InputNumber,
    Upload,
    Spin,
    notification,
    Select,
    Image,
} from "antd";
import {
    UploadOutlined,
    PlusOutlined,
    PictureOutlined,
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
    { label: "WiFi", value: "WIFI" },
    { label: "Điều hòa", value: "AIR_CONDITIONING" },
    { label: "TV", value: "TV" },
    { label: "Mini bar", value: "MINI_BAR" },
    { label: "Dịch vụ phòng", value: "ROOM_SERVICE" },
    { label: "Hồ bơi", value: "SWIMMING_POOL" },
    { label: "Phòng gym", value: "GYM" },
    { label: "Spa", value: "SPA" },
    { label: "Bãi đỗ xe", value: "PARKING" },
    { label: "Bao gồm bữa sáng", value: "BREAKFAST_INCLUDED" },
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
                star: 5.0,
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
            <div className="py-2">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Cột trái: Hình ảnh */}
                    <div className="w-full md:w-[350px] shrink-0 flex flex-col gap-4">
                        {/* Ảnh đại diện */}
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                                Ảnh đại diện <span className="text-red-500">*</span>
                            </span>
                            <div className="mb-5 w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-2xs">
                                {mainImage ? (
                                    <Image
                                        src={URL.createObjectURL(mainImage)}
                                        alt="Ảnh đại diện"
                                        width="100%"
                                        height="100%"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 text-xs">
                                        <PictureOutlined className="text-3xl mb-1 text-slate-300" />
                                        <span>Chưa chọn ảnh đại diện</span>
                                    </div>
                                )}
                            </div>
                            <Upload
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    setMainImage(file);
                                    return false;
                                }}
                            >
                                <Button icon={<UploadOutlined />} block>
                                    {mainImage ? "Thay đổi ảnh đại diện" : "Chọn ảnh đại diện"}
                                </Button>
                            </Upload>
                        </div>

                        {/* Bộ sưu tập ảnh chi tiết */}
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                                Ảnh chi tiết ({otherImages.length})
                            </span>
                            <Upload
                                beforeUpload={() => false}
                                listType="picture-card"
                                fileList={otherImages.map((f, i) => ({
                                    uid: i,
                                    name: f.name,
                                    status: "done",
                                    url: URL.createObjectURL(f),
                                    fileOriginal: f,
                                }))}
                                onChange={({ file, fileList }) => {
                                    if (file.status === "removed") {
                                        setOtherImages(otherImages.filter((_, idx) => idx !== file.uid));
                                    } else {
                                        const newFiles = fileList
                                            .map((item) => item.fileOriginal || item.originFileObj || item)
                                            .filter(Boolean);
                                        setOtherImages(newFiles);
                                    }
                                }}
                                multiple
                            >
                                <div className="flex flex-col items-center text-slate-500 text-xs">
                                    <PlusOutlined />
                                    <span className="mt-1">Thêm ảnh</span>
                                </div>
                            </Upload>
                        </div>
                    </div>

                    {/* Cột phải: Toàn bộ thông tin chi tiết */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                        {/* Chọn cơ sở & Tên loại phòng */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Cơ Sở Lưu Trú <span className="text-red-500">*</span>:
                                </label>
                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="Chọn cơ sở lưu trú"
                                    value={targetAccommodationId || undefined}
                                    onChange={(val) => setTargetAccommodationId(val)}
                                    options={(listHotel || []).map((hotel) => ({
                                        value: hotel.accommodationId,
                                        label: `${hotel.accommodationName} (#${hotel.accommodationId})`,
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Tên Loại Phòng <span className="text-red-500">*</span>:
                                </label>
                                <Input
                                    placeholder="Ví dụ: Deluxe Hướng Biển, VIP Double..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Khối Bảng Giá (Pricing Box) */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                            <div className="grid grid-cols-3 gap-3 items-center">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                        Giá niêm yết <span className="text-red-500">*</span>
                                    </span>
                                    <InputNumber
                                        min={0}
                                        step={50000}
                                        value={price}
                                        onChange={(val) => setPrice(Number(val) || 0)}
                                        suffix="VNĐ"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                        Giảm giá
                                    </span>
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={discount}
                                        onChange={(val) => setDiscount(Number(val) || 0)}
                                        suffix="%"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-emerald-700 block mb-1">
                                        Giá thực tế
                                    </span>
                                    <span className="text-base font-bold text-emerald-600 block">
                                        {formatVND(finalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Khối Thông số phòng (Specs Box) */}
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5">
                            <div className="grid grid-cols-2 gap-3 items-center">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                        Số phòng ngủ
                                    </span>
                                    <InputNumber
                                        min={1}
                                        value={numberOfBedrooms}
                                        onChange={(val) => setNumberOfBedrooms(Number(val) || 1)}
                                        style={{ width: "100%" }}
                                        addonAfter="phòng"
                                    />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                        Sức chứa tối đa
                                    </span>
                                    <InputNumber
                                        min={1}
                                        value={maxGuests}
                                        onChange={(val) => setMaxGuests(Number(val) || 1)}
                                        style={{ width: "100%" }}
                                        addonAfter="khách"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Khối Mô tả */}
                        <div>
                            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                                Mô tả loại phòng
                            </span>
                            <TextArea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập mô tả không gian, tầm nhìn, dịch vụ của loại phòng..."
                                className="rounded-lg text-sm"
                            />
                        </div>

                        {/* Khối Tiện nghi */}
                        <div>
                            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                                Tiện nghi & Dịch vụ
                            </span>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <Checkbox.Group
                                    options={AMENITY_OPTIONS}
                                    value={amenities}
                                    onChange={(vals) => setAmenities(vals)}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
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