import { Avatar, Button, DatePicker, Image, Input, notification, Select, Spin, Upload } from "antd";
import { useContext, useEffect, useState } from "react";
import { getUserInfo, updateUserInfo } from "../services/UserService";
import { EditOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { globalContext } from "../context/GlobalContext";
import { uploadFile } from "../services/UploadFileService";
import dayjs from "../config/DayjsConfig";
// import dayjs from "dayjs";

const UserInfo = () => {

    const genderOptions = [
        {
            value: "OTHER",
            label: "Khác"
        },
        {
            value: "MALE",
            label: "Nam"
        },
        {
            value: "FEMALE",
            label: "Nữ"
        }
    ];

    const {
        userInfo, setUserInfo
    } = useContext(globalContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState(null);
    const [birthday, setBirthday] = useState("");
    const [address, setAddress] = useState("");
    const [avatar, setAvatar] = useState(null);

    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        setName(userInfo?.name || "");
        setEmail(userInfo?.email || "");
        setPhone(userInfo?.phone || "");
        const genderObj = genderOptions.find(option => option.label === userInfo?.gender);
        setGender(genderObj?.value || "OTHER");
        setBirthday(userInfo?.birthday || "");
        setAddress(userInfo?.address || "");
    }, [userInfo]);

    const handleAvatarChange = ({ fileList }) => {
        setAvatar(fileList[0]);
    };

    const handleUpdateUserInfo = async () => {
        try {
            setIsLoadingUpdate(true);
            console.log("Gender selected", gender);


            let avatarUrl = null;
            if (avatar) {
                const uploadResult = await uploadFile(avatar.originFileObj);
                avatarUrl = uploadResult.data.filePath;
            }

            if (birthday.length === 0) {
                throw new Error("Ngày sinh không được để trống");
            }

            const data = {
                name,
                email,
                phone,
                gender: gender,
                birthday,
                address,
                avatarUrl
            };
            console.log("Data to update:", data);
            const response = await updateUserInfo(data);
            setIsEdit(false);
            setUserInfo(response.data);
            notification.success({
                message: "Cập nhật thông tin thành công"
            });
        } catch (error) {
            notification.error({
                message: error.response?.data?.message || error.message || "Cập nhật thông tin thất bại"
            });
        } finally {
            setIsLoadingUpdate(false);
        }
    };


    return (
        <>
            {
                <Spin spinning={isLoadingUpdate} tip="Đang cập nhật...">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Thông Tin Người Dùng
                                <span className="text-xl text-gray-500 ml-2">#{userInfo?.id}</span>
                            </h2>

                            {
                                isEdit ? (
                                    <div className="flex gap-2">
                                        <Button type="primary" onClick={handleUpdateUserInfo}>
                                            Lưu
                                        </Button>
                                        <Button onClick={() => {
                                            setBirthday(userInfo?.birthday || "");
                                            setIsEdit(false);
                                        }}>
                                            Hủy
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="primary" icon={<EditOutlined />} onClick={() => {
                                        setAvatar(null);
                                        setIsEdit(true);
                                    }}>
                                        Chỉnh sửa
                                    </Button>
                                )
                            }
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-shrink-0 mr-15 flex flex-col items-center gap-4">
                                {
                                    isEdit ? (
                                        <>
                                            <Image
                                                width={200}
                                                src={avatar ? URL.createObjectURL(avatar.originFileObj) : userInfo?.avatarUrl}
                                                className="rounded-xl object-cover"
                                                fallback="https://placehold.co/200x250?text=No+Image"

                                            />
                                        </>
                                    )
                                        :
                                        (
                                            <Image
                                                width={200}
                                                src={userInfo?.avatarUrl}
                                                className="rounded-xl object-cover"
                                                fallback="https://placehold.co/200x250?text=No+Image"
                                            />
                                        )
                                }

                                {
                                    isEdit && (
                                        <>
                                            <Upload beforeUpload={() => false} onChange={handleAvatarChange} showUploadList={false} accept="image/*" maxCount={1}>
                                                <Button icon={<UploadOutlined />}>Tải lên</Button>
                                            </Upload>
                                        </>)
                                }
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 text-sm items-center">
                                <div>
                                    <p className="text-gray-500 mb-3">Họ và tên</p>
                                    <Input
                                        bordered={isEdit}
                                        disabled={!isEdit}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={!isEdit ? { paddingLeft: 0 } : {}}
                                    />
                                </div>

                                <div>
                                    <p className="text-gray-500 mb-3">Email</p>
                                    <Input
                                        bordered={isEdit}
                                        disabled={!isEdit}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={!isEdit ? { paddingLeft: 0 } : {}}

                                    />
                                </div>

                                <div>
                                    <p className="text-gray-500 mb-3">Giới tính</p>
                                    <Select
                                        options={genderOptions}
                                        value={gender}
                                        onChange={(value) => {
                                            console.log("Selected gender value:", value);
                                            setGender(value)
                                        }}
                                        disabled={!isEdit}
                                        bordered={isEdit}
                                        style={{ width: "100%" }}
                                        placeholder="Chọn giới tính"
                                    />
                                </div>


                                <div>
                                    <p className="text-gray-500">Ngày sinh</p>

                                    <DatePicker
                                        disabled={!isEdit}
                                        value={dayjs(birthday)}
                                        format="DD-MM-YYYY"
                                        onChange={(date) => {
                                            if (date) {
                                                const iso = date.tz("UTC", true).toISOString();
                                                setBirthday(iso);
                                            } else {
                                                const iso = dayjs().tz("UTC", true).toISOString();
                                                setBirthday(iso);
                                            }
                                        }}
                                        style={!isEdit ? { paddingLeft: 0, width: "100%" } : { width: "100%" }}
                                    />
                                </div>
                                <div>
                                    <p className="text-gray-500">Số điện thoại</p>
                                    <Input
                                        bordered={isEdit}
                                        disabled={!isEdit}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={!isEdit ? { paddingLeft: 0 } : {}}
                                    />
                                </div>

                                <div >
                                    <p className="text-gray-500">Địa chỉ</p>
                                    <Input
                                        bordered={isEdit}
                                        disabled={!isEdit}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        style={!isEdit ? { paddingLeft: 0 } : {}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Spin>

            }
        </>
    )


}

export default UserInfo;