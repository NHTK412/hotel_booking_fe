import { Button, Divider, Image, Modal, notification, Spin, Table, Tag, Row, Col, Card, Space, Tooltip, InputNumber, Rate, Checkbox, Upload, Input, Form, Tabs, Badge } from "antd";
import { useContext, useEffect, useState } from "react";
import { getListRoomByRoomTypeId, getRoomTypeDetail, updateRoomType } from "../../services/RoomService";
import { StarOutlined, HomeOutlined, WifiOutlined, EnvironmentOutlined, StarFilled, EditOutlined, DeleteOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, PlusOutlined, InfoCircleOutlined, ApartmentOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { uploadFile, uploadFileMultiple } from "../../services/UploadFileService";
import { globalContext } from "../../context/GlobalContext";
import RoomTable from "./RoomTable";

const RoomTypeDetail = ({ isShow, setIsShow, roomTypeSelected, onUpdate }) => {
    const Amenityoptions = [
        { label: "WiFi", value: "WIFI" },
        { label: "Điều hòa", value: "AIR_CONDITIONING" },
        { label: "TV", value: "TV" },
        { label: "Mini bar", value: "MINI_BAR" },
        { label: "Dịch vụ phòng", value: "ROOM_SERVICE" },
        { label: "Hồ bơi", value: "SWIMMING_POOL" },
        { label: "Phòng gym", value: "GYM" },
        { label: "Spa", value: "SPA" },
        { label: "Bãi đỗ xe", value: "PARKING" },
        { label: "Bao gồm bữa sáng", value: "BREAKFAST_INCLUDED" }
    ];

    const { listHotel, hotelCurrent } = useContext(globalContext);
    const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isManager =
        listHotel[hotelCurrent]?.staffRole === "ROLE_MANAGER" ||
        listHotel[hotelCurrent]?.staffRole === "ROLE_HOST" ||
        userRole === "HOST";

    const [activeTab, setActiveTab] = useState("info");
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [bedroom, setBedroom] = useState(0);
    const [capacity, setCapacity] = useState(0);
    const [amenities, setAmenities] = useState([]);
    const [isEditting, setIsEditting] = useState(false);

    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
    const [roomTypeDetail, setRoomTypeDetail] = useState(null);
    const [listRoom, setListRoom] = useState([]);

    const fetchRoomTypeDetail = async () => {
        try {
            setIsLoadingRoomTypes(true);
            const response = await getRoomTypeDetail(roomTypeSelected.roomtypeId);
            setRoomTypeDetail(response.data);
            const responseListRoom = await getListRoomByRoomTypeId(roomTypeSelected.roomtypeId);
            setListRoom(responseListRoom.data);

            setName(response.data.name);
            setPrice(response.data.price);
            setDiscount(response.data.discount);
            setDescription(response.data.description);
            setImage({
                uid: -1,
                name: response.data.image.split("/").pop(),
                status: "done",
                url: response.data.image
            });


            const iP = response.data.imagesPreview.map((image, index) => {
                return {
                    uid: index,
                    name: image.split("/").pop(),
                    status: "done",
                    url: image,
                }
            });
            setImagesPreview(iP || []);

            setBedroom(response.data.bedroom);
            setCapacity(response.data.capacity);
            setAmenities(response.data.amenities || []);



        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Không thể tải chi tiết loại phòng"
            });
        }
        finally {
            setIsLoadingRoomTypes(false);
        }
    }

    useEffect(() => {
        if (isShow && roomTypeSelected) {
            fetchRoomTypeDetail();
        }
    }, [isShow, roomTypeSelected]);


    const handleUpdateRoomType = async () => {
        if (discount < 0 || discount > 100) {
            notification.warning({
                message: "Giảm giá không hợp lệ",
                description: "Tỷ lệ giảm giá phải từ 0% đến 100%."
            });
            return;
        }

        try {
            setIsLoadingRoomTypes(true);

            const imageUpdate = (image?.url !== roomTypeDetail.image) ? (await uploadFile(image.fileOriginal)).data.filePath : roomTypeDetail.image;

            const newImageFiles = imagesPreview.filter(image => image.fileOriginal).map(image => image.fileOriginal);
            let imagePreviewUrls = [];
            if (newImageFiles.length > 0) {
                const responseUpload = await uploadFileMultiple(newImageFiles);

                imagePreviewUrls = [
                    ...imagesPreview.filter(image => !image.fileOriginal).map(image => image.url),
                    ...responseUpload.data.map(item => item.filePath)
                ]
            }
            else {
                imagePreviewUrls = imagesPreview.filter(image => !image.fileOriginal).map(image => image.url);
            }


            const currentAccommodationId = listHotel[hotelCurrent]?.accommodationId || roomTypeSelected?.accommodationId;

            const data = {
                accommodationId: currentAccommodationId,
                name,
                price: Number(price),
                discount: Number(discount) || 0,
                description,
                image: imageUpdate,
                imagesPreview: imagePreviewUrls,
                bedroom: Number(bedroom) || 1,
                capacity: Number(capacity) || 1,
                amenities
            };

            const response = await updateRoomType(roomTypeSelected.roomtypeId, data);

            console.log("Response sau khi cập nhật: ", response);

            fetchRoomTypeDetail();
            if (onUpdate) onUpdate();
            notification.success({
                message: "Thành công",
                description: "Cập nhật loại phòng thành công"
            });

        } catch (error) {
            console.error("Lỗi khi cập nhật loại phòng: ", error);
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Cập nhật loại phòng thất bại"
            });
        }
        finally {
            setIsLoadingRoomTypes(false);
            setIsEditting(false);
            // setIsUpdating(!isUpdating);

        }
    }

    const handleChangeImage = ({ file }) => {
        const newImage = {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: URL.createObjectURL(file),
            fileOriginal: file
        };
        setImage(newImage);
    }

    const handelChangeImagesPreview = ({ file }) => {
        if (file.status === "removed") {
            const newListImagePreview = imagesPreview.filter(item => item.uid !== file.uid);
            setImagesPreview(newListImagePreview);
            return;
        }
        const newListImagePreview = [...imagesPreview, {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: URL.createObjectURL(file),
            fileOriginal: file
        }];
        setImagesPreview(newListImagePreview);
    }

    const handleClickButtonCancel = () => {
        setIsEditting(false)
        setName(roomTypeDetail.name);
        setPrice(roomTypeDetail.price);
        setDiscount(roomTypeDetail.discount);
        setDescription(roomTypeDetail.description);
        setBedroom(roomTypeDetail.bedroom);
        setCapacity(roomTypeDetail.capacity);
        setAmenities(roomTypeDetail.amenities || []);

        setImage({
            uid: -1,
            name: roomTypeDetail.image.split("/").pop(),
            status: "done",
            url: roomTypeDetail.image
        });

        const iP = roomTypeDetail.imagesPreview.map((image, index) => {
            return {
                uid: index,
                name: image.split("/").pop(),
                status: "done",
                url: image,
            }
        });
        setImagesPreview(iP || []);

    }



    return (
        <>
            <Modal
                title={null}
                open={isShow}
                onCancel={() => {
                    setIsEditting(false);
                    setActiveTab("info");
                    setIsShow(false);
                }}
                footer={null}
                width={960}
                styles={{
                    body: {
                        maxHeight: "85vh",
                        overflowY: "auto",
                        padding: "16px 20px"
                    },
                }}
            >
                <Spin spinning={isLoadingRoomTypes} description="Đang tải...">
                    {roomTypeDetail && (
                        <>
                            {/* Header chi tiết & nút hành động */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                {!isEditting ? (
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-slate-800 m-0">
                                            {roomTypeDetail.name}
                                        </h2>
                                        <Tag color="blue" className="font-mono text-xs m-0">
                                            #{roomTypeDetail.roomtypeId}
                                        </Tag>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-1 mr-4">
                                        <span className="text-xs font-semibold text-slate-700 shrink-0">
                                            Tên loại phòng:
                                        </span>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nhập tên loại phòng..."
                                            className="font-medium max-w-md"
                                        />
                                    </div>
                                )}

                                {isManager && activeTab === "info" && (
                                    !isEditting ? (
                                        <Button
                                            type="primary"
                                            ghost
                                            icon={<EditOutlined />}
                                            onClick={() => setIsEditting(true)}
                                            className="font-medium"
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleClickButtonCancel}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                onClick={handleUpdateRoomType}
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="mt-2"
                                items={[
                                    {
                                        key: "info",
                                        label: (
                                            <span className="flex items-center gap-1.5 font-semibold">
                                                <InfoCircleOutlined />
                                                Thông tin phòng
                                            </span>
                                        ),
                                        children: (
                                            <div className="pt-2">
                                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                                    {/* Cột trái: Hình ảnh */}
                                                    <div className="w-full md:w-[350px] shrink-0 flex flex-col gap-4">
                                                        {/* Ảnh đại diện */}
                                                        <div>
                                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                                                                Ảnh đại diện
                                                            </span>
                                                            <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-2xs">
                                                                <Image
                                                                    src={isEditting ? image?.url : roomTypeDetail.image}
                                                                    alt={isEditting ? (name || "Ảnh đại diện") : roomTypeDetail.name}
                                                                    width="100%"
                                                                    height="100%"
                                                                    style={{ objectFit: "cover" }}
                                                                    fallback="https://placehold.co/400x300?text=Image+Error"
                                                                />
                                                            </div>
                                                            {isEditting && (
                                                                <Upload
                                                                    showUploadList={false}
                                                                    beforeUpload={() => false}
                                                                    onChange={handleChangeImage}
                                                                    className="w-full mt-2"
                                                                >
                                                                    <Button icon={<UploadOutlined />} block>
                                                                        Đổi ảnh đại diện
                                                                    </Button>
                                                                </Upload>
                                                            )}
                                                        </div>

                                                        {/* Bộ sưu tập ảnh chi tiết */}
                                                        <div>
                                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                                                                Ảnh chi tiết ({roomTypeDetail.imagesPreview?.length || 0})
                                                            </span>
                                                            {!isEditting ? (
                                                                roomTypeDetail.imagesPreview?.length > 0 ? (
                                                                    <div className="grid grid-cols-4 gap-2">
                                                                        {roomTypeDetail.imagesPreview.map((img, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className="h-16 rounded-lg overflow-hidden border border-slate-200 hover:opacity-85 transition shadow-2xs"
                                                                            >
                                                                                <Image
                                                                                    src={img}
                                                                                    alt={`${roomTypeDetail.name} ${index + 1}`}
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                    style={{ objectFit: "cover" }}
                                                                                    fallback="https://placehold.co/400x300?text=Image+Error"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 italic m-0">Chưa có ảnh chi tiết</p>
                                                                )
                                                            ) : (
                                                                <Upload
                                                                    beforeUpload={() => false}
                                                                    listType="picture-card"
                                                                    fileList={imagesPreview}
                                                                    onChange={handelChangeImagesPreview}
                                                                >
                                                                    <div className="flex flex-col items-center text-slate-500 text-xs">
                                                                        <PlusOutlined />
                                                                        <span className="mt-1">Thêm ảnh</span>
                                                                    </div>
                                                                </Upload>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Cột phải: Toàn bộ thông tin chi tiết */}
                                                    <div className="flex-1 w-full flex flex-col gap-4">
                                                        {/* Khối Giá & Giảm giá */}
                                                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                                                            <div className="grid grid-cols-3 gap-3 items-center">
                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                                                        Giá niêm yết
                                                                    </span>
                                                                    {!isEditting ? (
                                                                        <span className="text-base font-bold text-slate-800">
                                                                            {Number(roomTypeDetail.price || 0).toLocaleString()} VNĐ
                                                                        </span>
                                                                    ) : (
                                                                        <InputNumber
                                                                            min={0}
                                                                            step={50000}
                                                                            value={price}
                                                                            onChange={(value) => setPrice(Number(value) || 0)}
                                                                            suffix="VNĐ"
                                                                            style={{ width: "100%" }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                                                        Giảm giá
                                                                    </span>
                                                                    {!isEditting ? (
                                                                        Number(roomTypeDetail.discount) > 0 ? (
                                                                            <Tag color="error" className="font-semibold text-sm m-0">
                                                                                -{Number(roomTypeDetail.discount)}%
                                                                            </Tag>
                                                                        ) : (
                                                                            <span className="text-sm text-slate-400 font-medium">0%</span>
                                                                        )
                                                                    ) : (
                                                                        <InputNumber
                                                                            min={0}
                                                                            max={100}
                                                                            step={1}
                                                                            value={discount}
                                                                            onChange={(value) => setDiscount(Number(value) || 0)}
                                                                            suffix="%"
                                                                            style={{ width: "100%" }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs font-semibold text-emerald-700 block mb-1">
                                                                        Giá thực tế
                                                                    </span>
                                                                    <span className="text-base font-bold text-emerald-600">
                                                                        {Math.max(
                                                                            0,
                                                                            Math.round(
                                                                                (isEditting ? (Number(price) || 0) : (Number(roomTypeDetail.price) || 0)) *
                                                                                (1 - (isEditting ? (Number(discount) || 0) : (Number(roomTypeDetail.discount) || 0)) / 100)
                                                                            )
                                                                        ).toLocaleString()} VNĐ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Khối Quy chuẩn phòng */}
                                                        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5">
                                                            <div className="grid grid-cols-3 gap-3 items-center">
                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                                                        Đánh giá
                                                                    </span>
                                                                    <Rate disabled value={Number(roomTypeDetail.star || 5)} className="text-xs" />
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                                                        Số phòng ngủ
                                                                    </span>
                                                                    {!isEditting ? (
                                                                        <span className="text-sm font-semibold text-slate-700">
                                                                            {roomTypeDetail.bedroom || 1} phòng
                                                                        </span>
                                                                    ) : (
                                                                        <InputNumber
                                                                            min={1}
                                                                            value={bedroom}
                                                                            onChange={(value) => setBedroom(Number(value) || 1)}
                                                                            style={{ width: "100%" }}
                                                                            addonAfter="phòng"
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                                                        Sức chứa tối đa
                                                                    </span>
                                                                    {!isEditting ? (
                                                                        <span className="text-sm font-semibold text-slate-700">
                                                                            {roomTypeDetail.capacity || 2} khách
                                                                        </span>
                                                                    ) : (
                                                                        <InputNumber
                                                                            min={1}
                                                                            value={capacity}
                                                                            onChange={(value) => setCapacity(Number(value) || 1)}
                                                                            style={{ width: "100%" }}
                                                                            addonAfter="khách"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Khối Mô tả */}
                                                        <div>
                                                            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                                                                Mô tả loại phòng
                                                            </span>
                                                            {!isEditting ? (
                                                                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line text-justify">
                                                                    {roomTypeDetail.description || (
                                                                        <span className="italic text-slate-400">Chưa có mô tả cho loại phòng này.</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <TextArea
                                                                    rows={3}
                                                                    value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    placeholder="Nhập mô tả không gian, tầm nhìn, dịch vụ của loại phòng..."
                                                                    className="rounded-lg text-sm"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Khối Tiện nghi */}
                                                        <div>
                                                            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                                                                Tiện nghi & Dịch vụ
                                                            </span>
                                                            {!isEditting ? (
                                                                roomTypeDetail?.amenities?.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {roomTypeDetail.amenities.map((item, index) => (
                                                                            <span
                                                                                key={index}
                                                                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80"
                                                                            >
                                                                                {item.replaceAll("_", " ")}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400 italic">Chưa có tiện nghi được thiết lập.</span>
                                                                )
                                                            ) : (
                                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                                    <Checkbox.Group
                                                                        options={Amenityoptions}
                                                                        value={amenities}
                                                                        onChange={(value) => setAmenities(value)}
                                                                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "rooms",
                                        label: (
                                            <span className="flex items-center gap-1.5 font-semibold">
                                                <ApartmentOutlined />
                                                Danh sách phòng vật lý
                                                <Badge
                                                    count={listRoom?.length || 0}
                                                    overflowCount={999}
                                                    style={{ backgroundColor: "#1677ff", marginLeft: 4 }}
                                                />
                                            </span>
                                        ),
                                        children: (
                                            <div className="pt-2">
                                                <RoomTable
                                                    currentRoomType={roomTypeDetail}
                                                    listRoom={listRoom}
                                                    setListRoom={setListRoom}
                                                    fetchRoomTypeDetail={fetchRoomTypeDetail}
                                                />
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </>
                    )}
                </Spin>
            </Modal>
</>);
}


export default RoomTypeDetail;