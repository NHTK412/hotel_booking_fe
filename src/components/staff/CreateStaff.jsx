import { Button, DatePicker, Image, Input, notification, Radio, Spin, Upload } from "antd";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";
import { uploadFile } from "../../services/UploadFileService";
import { createStaff } from "../../services/userService";

const CreateStaff = ({ fetchStaffByHotel, currentPageSize, currentPage, setIsShowCreateStaff, isDeleted, setIsDeleted }) => {

    const genderOptions = [
        { value: "OTHER", label: "Khác" },
        { value: "MALE", label: "Nam" },
        { value: "FEMALE", label: "Nữ" },
    ];

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [birthday, setBirthday] = useState("01-01-2000");
    const [gender, setGender] = useState("OTHER");
    const [address, setAddress] = useState("");
    const [file, setFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const { listHotel, hotelCurrent } = useContext(globalContext);

    const handleNewStaff = async () => {
        try {
            setIsLoading(true);
            const responseFile = await uploadFile(file);


            const data = {
                phone,
                email,
                name,
                birthday: dayjs(birthday, 'DD-MM-YYYY').format("YYYY-MM-DD[T]00:00:00"),
                gender,
                address,
                avatarUrl: responseFile.data.filePath,
                hostRole: "ROLE_RECEPTIONIST"
            };

            const response = await createStaff(listHotel[hotelCurrent]?.accommodationId, data);

            setIsShowCreateStaff(false);

            notification.success({
                title: "Thành công",
                description: "Nhân viên mới đã được tạo thành công"
            });
            await fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);


        } catch (error) {
            notification.error({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tạo nhân viên mới"
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <Spin spinning={isLoading}>
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col items-center space-y-2">
                    <Upload beforeUpload={() => false} onChange={({ file }) => setFile(file)} showUploadList={false}>
                        {
                            file ? (
                                <img style={{ width: 200, height: 200, overflow: 'hidden' }} src={URL.createObjectURL(file)} className="hover:cursor-pointer" />

                            ) : (
                                <div className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg hover:cursor-pointer">
                                    <span className="text-gray-400">Click để tải ảnh lên</span>
                                </div>
                            )
                        }
                    </Upload>
                </div>
                <div>
                    <h2 className="">Tên nhân viên</h2>
                    <Input
                        placeholder="Nhập tên nhân viên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        status={!name.trim() ? "error" : ""}
                    />
                </div>
                <div>
                    <h2>Số điện thoại</h2>
                    <Input
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        status={!phone.trim() ? "error" : ""}
                    />
                </div>
                <div>
                    <h2>Email</h2>
                    <Input
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        status={!email.trim() ? "error" : ""}
                    />
                </div>
                <div className="flex flex-row justify-between">
                    <div>
                        <h2>Ngày sinh</h2>
                        <DatePicker
                            format="DD-MM-YYYY"
                            defaultValue={dayjs(birthday, 'DD-MM-YYYY')}
                            onChange={(date, dateString) => setBirthday(dateString)}
                        />
                    </div>
                    <div>
                        <h2>Giới tính</h2>

                        <Radio.Group onChange={(e) => setGender(e.target.value)} value={gender} options={genderOptions} >
                        </Radio.Group>

                    </div>
                </div>
                <div>
                    <h2>Địa chỉ</h2>
                    <Input
                        placeholder="Nhập địa chỉ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <Button color="primary" variant="solid" onClick={handleNewStaff}>
                    Thêm nhân viên
                </Button>

            </div>

        </Spin >

    )
}

export default CreateStaff;