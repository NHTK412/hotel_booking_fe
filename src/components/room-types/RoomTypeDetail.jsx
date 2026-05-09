import { Button, Divider, Image, Modal, notification, Spin, Table, Tag, Row, Col, Card, Space, Tooltip, InputNumber, Rate, Checkbox, Upload, Input, Form } from "antd";
import { useContext, useEffect, useState } from "react";
import { getListRoomByRoomTypeId, getRoomTypeDetail, updateRoomType } from "../../services/RoomService";
import { StarOutlined, HomeOutlined, WifiOutlined, EnvironmentOutlined, StarFilled, EditOutlined, DeleteOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
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
                title: "Lỗi",
                description: "Không thể tải chi tiết loại phòng"
            })
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



    // const getAmenityLabel = (amenity) => {
    //     return Amenityoptions.find(option => option.value === amenity)?.label || amenity;
    // };

    const handleUpdateRoomType = async () => {
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


            const data = {
                name,
                price,
                discount,
                description,
                image: imageUpdate,
                imagesPreview: imagePreviewUrls,
                bedroom,
                capacity,
                amenities
            }

            const response = await updateRoomType(roomTypeSelected.roomtypeId, data);

            console.log("Response sau khi cập nhật: ", response);

            fetchRoomTypeDetail();
            onUpdate();
            notification.success({
                title: "Thành công",
                description: "Cập nhật loại phòng thành công"
            })

        } catch (error) {
            console.error("Lỗi khi cập nhật loại phòng: ", error);
            notification.error({
                title: "Lỗi",
                description: "Cập nhật loại phòng thất bại"
            })
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
                    setIsShow(false)
                }}
                footer={null}
                width={1000}
                bodyStyle={{ padding: "16px", borderRadius: "8px" }}
                styles={{
                    body: {
                        maxHeight: "80vh",
                        overflowY: "auto"
                    },
                }}
            >
                <Spin spinning={isLoadingRoomTypes} description="Đang tải...">
                    {roomTypeDetail && (
                        <>
                            <div className="flex flex-row justify-between mr-5">
                                {
                                    !isEditting ?
                                        (
                                            <h2 className="text-2xl font-bold mb-4">{roomTypeDetail.name} - #{roomTypeDetail.roomtypeId}</h2>
                                        )
                                        :
                                        (
                                            <div className="flex flex-row mb-4 space-x-2 items-center w-[60%]">
                                                <p className="text-sm text-gray-500">Tên loại phòng: </p>
                                                <Input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "80%" }} />
                                            </div>
                                        )
                                }
                                {
                                    !isEditting ?
                                        (
                                            <Button color="primary" variant="filled" onClick={() => { setIsEditting(true) }}>
                                                <EditOutlined />
                                                Chỉnh sửa
                                            </Button>
                                        )
                                        :
                                        (
                                            <div className="flex flex gap-4">
                                                <Button color="danger" variant="filled" onClick={handleClickButtonCancel}>
                                                    <DeleteOutlined />
                                                    Hủy
                                                </Button>
                                                <Button color="primary" variant="filled" onClick={() => { handleUpdateRoomType() }}>
                                                    <SaveOutlined />
                                                    Lưu
                                                </Button>
                                            </div>
                                        )
                                }
                            </div>
                            <div className="flex flex gap-6">
                                <div className="flex flex-col gap-4">
                                    <div>
                                        {
                                            !isEditting ?
                                                (
                                                    <Image
                                                        src={roomTypeDetail.image}
                                                        alt={roomTypeDetail.name}
                                                        width={400}
                                                        height={300}
                                                        style={{
                                                            objectFit: "cover",
                                                            borderRadius: "12px"
                                                        }}
                                                        fallback="https://placehold.co/400x300?text=Image+Error"
                                                    />
                                                )
                                                :
                                                (
                                                    <>
                                                        <Image
                                                            src={image?.url}
                                                            alt={name || "Ảnh loại phòng"}
                                                            width={400}
                                                            height={300}
                                                            style={{
                                                                objectFit: "cover",
                                                                borderRadius: "12px"
                                                            }}
                                                        />
                                                        <Upload
                                                            showUploadList={false}
                                                            beforeUpload={() => false}
                                                            onChange={handleChangeImage}>
                                                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                                        </Upload>
                                                    </>
                                                )
                                        }
                                    </div>
                                    {
                                        !isEditting ?
                                            (
                                                roomTypeDetail.imagesPreview?.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-x-8 gap-y-4  items-center">
                                                        {roomTypeDetail.imagesPreview.map((image, index) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => setMainImage(image)}
                                                                className="cursor-pointer hover:opacity-80 transition"
                                                            >
                                                                <Image
                                                                    src={image}
                                                                    alt={`${roomTypeDetail.name} ${index + 1}`}
                                                                    width={100}
                                                                    height={70}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        borderRadius: "8px"
                                                                    }}
                                                                    fallback="https://placehold.co/400x300?text=Image+Error"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )
                                            :
                                            (
                                                <Upload
                                                    beforeUpload={() => false}
                                                    listType="picture-card"
                                                    fileList={imagesPreview}
                                                    onChange={handelChangeImagesPreview}
                                                >
                                                    <PlusOutlined />
                                                </Upload>
                                            )
                                    }
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Mô tả</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <>
                                                            <p className="text-gray-800 font-medium text-justify">
                                                                {roomTypeDetail.description}
                                                            </p>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <TextArea rows={10} value={description} onChange={(e) => setDescription(e.target.value)} />
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Giá phòng</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <>
                                                            <p className="text-blue-600 font-semibold">
                                                                {roomTypeDetail.price?.toLocaleString()} VNĐ
                                                            </p>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <InputNumber min={0} value={price} onChange={(value) => setPrice(value)} suffix=" VNĐ" style={{ width: "100%" }}
                                                        />
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Khuyến mãi</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <>
                                                            <p className="text-red-500 font-medium">
                                                                {roomTypeDetail.discount}%
                                                            </p>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <InputNumber min={0} max={100} value={discount} onChange={(value) => setDiscount(value)} suffix="%" style={{ width: "100%" }} />
                                                    )
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số sao</p>
                                            <Rate value={roomTypeDetail.star} disabled />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số phòng ngủ</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <>
                                                            <p className="text-gray-800 font-medium">
                                                                {roomTypeDetail.bedroom}
                                                            </p>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <InputNumber min={1} value={bedroom} onChange={(value) => setBedroom(value)} style={{ width: "100%" }} />
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số người tối đa</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <>
                                                            <p className="text-gray-800 font-medium">
                                                                {roomTypeDetail.capacity}
                                                            </p>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <InputNumber min={1} value={capacity} onChange={(value) => setCapacity(value)} style={{ width: "100%" }} />
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Tiện ích</p>
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="flex flex-wrap gap-2">
                                                            {roomTypeDetail?.amenities?.map((item, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border"
                                                                >
                                                                    {item.replaceAll("_", " ")}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )
                                                    :
                                                    (
                                                        <>
                                                            <Checkbox.Group options={Amenityoptions} onChange={(value) => setAmenities(value)} value={amenities}></Checkbox.Group>
                                                        </>
                                                    )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div>

                                <RoomTable
                                    currentRoomType={roomTypeDetail}
                                    listRoom={listRoom}
                                    setListRoom={setListRoom}
                                    fetchRoomTypeDetail={fetchRoomTypeDetail}
                                >
                                </RoomTable>
                            </div>
                        </>
                    )
                    }
                </Spin>
            </Modal >
        </>);
}


export default RoomTypeDetail;