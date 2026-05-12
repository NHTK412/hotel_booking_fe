import { Button, Checkbox, Input, notification, Spin, Upload } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useContext, useState } from "react";
import { uploadFileMultiple, uploadFile } from "../../services/UploadFileService";
import { globalContext } from "../../context/GlobalContext";
import { createRoomType } from "../../services/RoomService";

const NewRoomType = ({
    fetchRoomTypes,
    setIsShowModalNewRoomType
}) => {

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

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [numberOfBedrooms, setNumberOfBedrooms] = useState(0);
    const [maxGuests, setMaxGuests] = useState(0);
    const [mainImage, setMainImage] = useState(null);
    const [otherImages, setOtherImages] = useState([]);
    const [amenities, setAmenities] = useState([]);

    const { listHotel, hotelCurrent } = useContext(globalContext);


    const handelNewRoomType = async () => {
        try {
            setIsLoading(true);

            const uploadMainResponse = await uploadFile(mainImage);
            const mainPath = uploadMainResponse.data.filePath;

            let otherPaths = [];
            if (otherImages.length > 0) {
                const uploadOtherResponses = await uploadFileMultiple(otherImages);
                otherPaths = uploadOtherResponses.data.map((res) => res.filePath);
            }


            const data = {
                name,
                price,
                discount: 0.0,
                imagesPreview: otherPaths,
                image: mainPath,
                amenities: amenities,
                accommodationId: listHotel[hotelCurrent].accommodationId,
                capacity: maxGuests,
                bedroom: numberOfBedrooms,
                description
            };

            const response = await createRoomType(data);

            // console.log("Dữ liệu loại phòng mới: ", data);
            notification.success({
                title: "Thành công",
                description: "Loại phòng mới đã được tạo thành công"
            });

            fetchRoomTypes();
            setIsShowModalNewRoomType(false);


        } catch (error) {
            console.error("Lỗi khi tạo loại phòng mới: ", error);
            notification.error({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tạo loại phòng mới"
            });
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <Spin spinning={isLoading}>
            <div className="flex flex-col space-y-4">
                <div>
                    <h2 className="">Tên loại phòng</h2>
                    <Input
                        placeholder="Nhập tên loại phòng"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        status={!name.trim() ? "error" : ""}
                    />
                </div>
                <div>
                    <h2>Mô tả</h2>
                    {/* <Input placeholder="Nhập mô tả" /> */}
                    <TextArea
                        placeholder="Nhập mô tả"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <h2>Giá phòng</h2>
                    <Input
                        placeholder="Nhập giá phòng"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        status={price === 0 ? "error" : ""}

                    />
                </div>
                <div>
                    <h2>Số phòng ngủ</h2>
                    <Input
                        placeholder="Nhập số phòng ngủ"
                        value={numberOfBedrooms}
                        onChange={(e) => setNumberOfBedrooms(Number(e.target.value))}
                    />
                </div>
                <div>
                    <h2>Khách tối đa</h2>
                    <Input
                        placeholder="Nhập khách tối đa"
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(Number(e.target.value))}
                    />
                </div>
                <div>
                    <h2>TIện ích</h2>
                    <Checkbox.Group
                        options={Amenityoptions}
                        value={amenities}
                        onChange={(checkedValues) => setAmenities(checkedValues)}
                    />
                </div>
                <div>
                    <h2>Hình ảnh đại diện</h2>
                    <Upload
                        beforeUpload={(file) => {
                            file.status = "done";
                            return false;

                        }}
                        onChange={({ fileList }) => {
                            setMainImage(fileList[0].originFileObj);
                        }}
                        listType="picture"
                        maxCount={1}
                    >
                        <Button>Upload</Button>
                    </Upload>
                </div>
                <div>
                    <h2>Hình ảnh khác</h2>
                    <Upload
                        beforeUpload={(file) => {
                            file.status = "done";
                            return false;

                        }}
                        onChange={({ fileList }) => {
                            setOtherImages(fileList.map((file) => file.originFileObj));
                        }}
                        listType="picture"
                        multiple
                        maxCount={10}
                    ><Button>Upload</Button></Upload>

                </div>

                <Button color="primary" variant="solid" onClick={handelNewRoomType}>
                    Thêm loại phòng
                </Button>

            </div >
        </Spin>
    );
}

export default NewRoomType;