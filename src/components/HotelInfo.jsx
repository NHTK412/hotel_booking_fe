import { Avatar, Button, Image, Input, Modal, notification, Select, Spin, Upload } from "antd";
import { useContext, useEffect, useState, useRef } from "react";
import { getUserInfo } from "../services/userService";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { globalContext } from "../context/GlobalContext";
import TextArea from "antd/es/input/TextArea";
import { getAllProvinceNames, getDistrictsByProvinceName } from "../services/LocationService";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { uploadFile } from "../services/UploadFileService";

const HotelInfo = () => {
    const { listHotel, hotelCurrent, isLoading } = useContext(globalContext);
    const hotel = listHotel?.[hotelCurrent];


    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const [hotelName, setHotelName] = useState("");
    const [hotelType, setHotelType] = useState("");
    const [hotelCity, setHotelCity] = useState("");
    const [hotelDistrict, setHotelDistrict] = useState("");
    const [hotelLocationId, setHotelLocationId] = useState();
    const [hotelAddress, setHotelAddress] = useState("");
    const [hotelDescription, setHotelDescription] = useState("");
    const [hotelLat, setHotelLat] = useState("");
    const [hotelLng, setHotelLng] = useState("");
    const [image, setImage] = useState(null);

    const [isShowMap, setIsShowMap] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

    const isManager = listHotel[hotelCurrent]?.staffRole === "ROLE_MANAGER";

    const hotelTypeOptions = [
        {
            value: "HOTEL",
            label: "Khách sạn"
        },
        {
            value: "HOSTEL",
            label: "Nhà trọ"
        },
        {
            value: "APARTMENT",
            label: "Căn hộ"
        },
        {
            value: "HOMESTAY",
            label: "Nhà ở"
        },
        {
            value: "RESORT",
            label: "Khu nghỉ dưỡng"
        }
    ]

    useEffect(() => {
        fetchProvinces();
        fillDataToForm();
    }, []);

    const fillDataToForm = () => {
        setHotelName(hotel?.accommodationName || "");
        setHotelType(hotel?.type || "");
        setHotelCity(hotel?.city || "");
        setHotelDistrict(hotel?.district || "");
        setHotelAddress(hotel?.address || "");
        setHotelDescription(hotel?.description || "");
        setHotelLat(hotel?.lat || "");
        setHotelLng(hotel?.lng || "");
        setImage({
            uid: -1,
            name: hotel?.image?.split("/").pop() || "",
            status: "done",
            url: hotel?.image || ""
        })
    };

    const fetchProvinces = async () => {
        try {
            const provincesData = await getAllProvinceNames();
            setProvinces(provincesData);

            const districtsData = await getDistrictsByProvinceName(hotel?.city);
            setDistricts(districtsData);
        } catch (error) {
            notification.error(
                {
                    title: "Lỗi",
                    description: "Không thể tải danh sách tỉnh thành"
                }
            )
        }
    }

    const handleProvinceChange = async (value) => {
        setHotelCity(value);
        try {
            const districtsData = await getDistrictsByProvinceName(value);
            setDistricts(districtsData);
        } catch (error) {
            notification.error(
                {
                    title: "Lỗi",
                    description: "Không thể tải danh sách quận huyện"
                }
            );
            console.error("Error fetching districts:", error);
        }
    }


    const handleUpdatehotelInfo = async () => {
        try {
            setIsLoadingUpdate(true);
            const responseFile = await uploadFile(image?.fileOriginal);

            const hotelData = {
                accommodationName: hotelName,
                type: hotelType,
                city: hotelCity,
                district: hotelDistrict,
                address: hotelAddress,
                description: hotelDescription,
                locationId: hotelLocationId,
                lat: hotelLat,
                lng: hotelLng,
                image: responseFile.data.filePath
            };

            console.log("Updated hotel data:", hotelData);

        } catch (error) {
            console.error("Error updating hotel info:", error);
            notification.error(
                {
                    title: "Lỗi",
                    description: "Cập nhật thông tin khách sạn thất bại"
                }
            );
        }
        finally {
            setIsLoadingUpdate(false);
        }
    }

    const LocationPicker = ({ onSelect }) => {
        useMapEvents({
            click(e) {

                const lat = e.latlng.lat
                const lng = e.latlng.lng

                onSelect({
                    lat,
                    lng
                })
            }
        })

        return null
    }


    return (
        <Spin spinning={isLoading || isLoadingUpdate}>
            {
                isLoading ?
                    (
                        <div className="flex justify-center items-center h-[83vh]">
                            <Spin size="large" />
                        </div>
                    ) :
                    (
                        <div className="space-y-6">
                            <div className="flex flex-row justify-between">
                                <h2 className="text-xl font-semibold">
                                    Thông Tin Khách Sạn
                                    <span className="text-xl text-gray-500 ml-2">
                                        #{hotel?.accommodationId}
                                    </span>
                                </h2>
                                {isManager && (
                                    !isEditing ? (
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            className="ml-4"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Chỉnh Sửa
                                        </Button>
                                    )
                                        :
                                        (
                                            <div className="flex gap-2">
                                                <Button
                                                    color="danger"
                                                    variant="solid"
                                                    onClick={() => {
                                                        fillDataToForm();
                                                        setIsEditing(false);
                                                    }}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    color="green"
                                                    variant="solid"
                                                    onClick={() => handleUpdatehotelInfo()}
                                                >
                                                    Lưu
                                                </Button>
                                            </div>
                                        )
                                )}
                            </div>

                            <div className="flex gap-6">
                                <div className="flex shrink-0 mr-15 items-center">
                                    {
                                        !isEditing ? (
                                            <>
                                                <Image
                                                    width={200}
                                                    src={hotel?.image}
                                                    className="rounded-xl object-cover"
                                                    fallback="https://placehold.co/200x250?text=No+Image"
                                                />
                                            </>
                                        )
                                            :
                                            (
                                                <div className="flex flex-col gap-4 items-center">
                                                    <Image
                                                        width={200}
                                                        src={image?.url}
                                                        className="rounded-xl object-cover"
                                                        fallback="https://placehold.co/200x250?text=No+Image"
                                                    />
                                                    <Upload beforeUpload={() => false} onChange={({ file }) => {
                                                        console.log("Selected file:", file);
                                                        setImage({
                                                            uid: file.uid,
                                                            name: file.name,
                                                            status: "done",
                                                            url: URL.createObjectURL(file),
                                                            fileOriginal: file
                                                        });
                                                    }} showUploadList={false} accept="image/*" maxCount={1}>
                                                        <Button icon={<UploadOutlined />}>Tải lên</Button>
                                                    </Upload>
                                                </div>
                                            )
                                    }

                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 text-sm items-center">

                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Tên khách sạn</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.accommodationName}</p>
                                            )
                                                :
                                                (
                                                    <Input value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
                                                )
                                        }
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Loại </p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotelTypeOptions.find((t) => t.value === hotel?.type)?.label}</p>
                                            )
                                                :
                                                (
                                                    <Select
                                                        options={hotelTypeOptions.map((type) => ({
                                                            value: type.value,
                                                            label: type.label
                                                        }))}
                                                        value={hotelType}
                                                        onChange={(value) => {
                                                            setHotelType(value)
                                                        }}
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn loại khách sạn"
                                                    />
                                                )
                                        }
                                    </div>


                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Thành phố</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.city}</p>
                                            )
                                                :
                                                (
                                                    <Select
                                                        options={provinces.map((province) => ({
                                                            value: province,
                                                            label: province
                                                        }))}
                                                        // value={hotel?.city}
                                                        value={hotelCity}
                                                        onChange={async (value) => {
                                                            setHotelCity(value)
                                                            const districtsData = await getDistrictsByProvinceName(value);
                                                            setDistricts(districtsData);
                                                            setHotelDistrict("");
                                                        }}
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn thành phố"
                                                    />
                                                )
                                        }
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Quận/Huyện</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.district}</p>
                                            )
                                                : (
                                                    <Select
                                                        options={districts.map((district) => ({
                                                            value: district.provinceName,
                                                            label: district.provinceName,
                                                            locationId: district?.locationId
                                                        }))}
                                                        value={hotelDistrict}
                                                        onChange={(value) => {
                                                            setHotelDistrict(value);
                                                            const hotelLocationId = districts.find((d) => d.provinceName === value)?.locationId || "";
                                                            setHotelLocationId(hotelLocationId);
                                                        }}
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn quận/huyện"
                                                    />
                                                )
                                        }
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Địa chỉ</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.address}</p>
                                            )
                                                :
                                                (
                                                    <Input value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} />
                                                )
                                        }
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-gray-500">Tọa độ</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.lat}, {hotel?.lng}</p>
                                            )
                                                :
                                                (
                                                    <div className="flex flex-row gap-3">
                                                        <Input value={hotelLat} placeholder="Vĩ độ" />
                                                        <Input value={hotelLng} placeholder="Kinh độ" />
                                                        <Button onClick={() => setIsShowMap(true)}>Chọn tọa độ</Button>
                                                        <Modal
                                                            title="Chọn tọa độ"
                                                            open={isShowMap}
                                                            onOk={() => {
                                                                setIsShowMap(false);
                                                            }}
                                                            onCancel={() => {
                                                                setHotelLat(hotel?.lat || "");
                                                                setHotelLng(hotel?.lng || "");
                                                                setIsShowMap(false);
                                                            }}
                                                            width={800}
                                                        >
                                                            <MapContainer center={[hotelLat, hotelLng]} zoom={13} style={{ height: 400, width: '100%' }}>
                                                                <TileLayer
                                                                    attribution='&copy; OpenStreetMap contributors'
                                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                                />
                                                                <LocationPicker onSelect={(location) => {
                                                                    setHotelLat(location.lat);
                                                                    setHotelLng(location.lng);
                                                                }} />
                                                                {
                                                                    hotelLat && hotelLng && (
                                                                        <Marker position={[hotelLat, hotelLng]} />
                                                                    )
                                                                }
                                                            </MapContainer>
                                                        </Modal>
                                                    </div>
                                                )
                                        }
                                    </div>

                                    <div className="col-span-2 flex flex-col gap-2">
                                        <p className="text-gray-500">Mô tả</p>
                                        {
                                            !isEditing ? (
                                                <p className="font-medium">{hotel?.description}</p>
                                            )
                                                :
                                                (
                                                    <TextArea value={hotelDescription} onChange={(e) => setHotelDescription(e.target.value)} />
                                                )
                                        }
                                    </div>

                                </div>
                            </div>
                        </div >
                    )
            }
        </Spin>
    )
}

export default HotelInfo;