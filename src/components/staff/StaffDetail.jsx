import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Image, Input, Modal, notification, Radio, Spin, Upload } from "antd";
import { useEffect, useState } from "react";
import { getUserById } from "../../services/UserService";

const StaffDetail = ({
    isShowStaffDetail, setIsShowStaffDetail, staffId
}) => {

    const genderOptions = [
        { value: "OTHER", label: "Khác" },
        { value: "MALE", label: "Nam" },
        { value: "FEMALE", label: "Nữ" },
    ];


    const [isLoadingStaffDetail, setIsLoadingStaffDetail] = useState(false);
    const [isEditting, setIsEditting] = useState(false);
    const [staffDetailData, setStaffDetailData] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState(null);


    useEffect(() => {
        if (isShowStaffDetail) {
            fetchStaffDetail(staffId);
        }
    }, [isShowStaffDetail, staffId]);

    const fetchStaffDetail = async (staffId) => {
        try {
            setIsLoadingStaffDetail(true);
            const response = await getUserById(staffId);
            const staffData = response.data;
            paseDataToInput(staffData);
        } catch (error) {
            console.error("Error fetching staff detail:", error);
            notification.error({
                title: "Lỗi",
                description: "Không thể tải thông tin nhân viên"
            });
        } finally {
            setIsLoadingStaffDetail(false);
        }
    }

    const paseDataToInput = (staffData) => {
        setStaffDetailData(staffData);
        setName(staffData.name);
        setEmail(staffData.email);
        setPhone(staffData.phone);
        setBirthday(staffData.birthday);
        const genderObj = genderOptions.find(option => option.label === staffData.gender);
        setGender(genderObj ? genderObj.value : "OTHER");
        setAddress(staffData.address);
        setImage({
            uid: -1,
            name: staffData.avatarUrl.split("/").pop(),
            status: "done",
            url: staffData.avatarUrl
        });
    }

    const handleUpdateStaff = async () => {
        try {
            setIsLoadingStaffDetail(true);

            const updatedData = {
                phone,
                email,
                name,
                birthday,
                gender: genderOptions.find(option => option.value === gender)?.value || "OTHER",
                address,
                avatarUrl: image?.url
            };

            console.log("Updated staff data:", updatedData);
            console.log("File", image);
        }
        catch (error) {
            console.error("Error updating staff:", error);
            notification.error({
                title: "Lỗi",
                description: "Cập nhật thông tin nhân viên thất bại"
            });
        }
        finally {
            setIsLoadingStaffDetail(false);
        }
    }

    return (
        <Modal
            title={null}
            footer={null}
            open={isShowStaffDetail}
            onCancel={() => {
                setIsShowStaffDetail(false);
                setIsEditting(false);
            }}
            bodyStyle={{ padding: "16px", borderRadius: "8px" }}
            styles={{
                body: {
                    maxHeight: "80vh",
                    overflowY: "auto"
                },
            }}
        >
            <Spin spinning={isLoadingStaffDetail} description="Đang tải...">
                {
                    staffDetailData && (
                        <>
                            <div className="flex flex-row justify-between mr-5">
                                <h2 className="text-2xl font-bold mb-4">Nhân viên - #{staffDetailData.id}</h2>
                                {
                                    !isEditting ?
                                        (
                                            <Button color="orange" variant="filled" onClick={() => { setIsEditting(true) }}>
                                                <EditOutlined />
                                                Chỉnh sửa
                                            </Button>
                                        )
                                        :
                                        (
                                            <div className="flex gap-4">
                                                <Button color="danger" variant="filled" onClick={() => {
                                                    paseDataToInput(staffDetailData);
                                                    setIsEditting(false);
                                                }}>
                                                    <DeleteOutlined />
                                                    Hủy
                                                </Button>
                                                <Button color="primary" variant="filled" onClick={() => handleUpdateStaff()}>
                                                    <SaveOutlined />
                                                    Lưu
                                                </Button>
                                            </div>
                                        )
                                }
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-md mx-auto">
                                <div className=" p-6">
                                    <div className="flex justify-center mb-6">
                                        {
                                            !isEditting ?
                                                (
                                                    <Image
                                                        src={staffDetailData.avatarUrl}
                                                        alt="Avatar"
                                                        width={100}
                                                        height={100}
                                                        className="rounded-full object-cover"
                                                    />
                                                )
                                                :
                                                (
                                                    <Upload
                                                        onBeforeUpload={() => false}
                                                        onChange={({ file }) => {
                                                            setImage({
                                                                uid: file.uid,
                                                                name: file.name,
                                                                status: "done",
                                                                url: URL.createObjectURL(file.originFileObj),
                                                                originFileObj: file.originFileObj
                                                            });
                                                        }}
                                                        showUploadList={false}
                                                    >
                                                        {
                                                            <img
                                                                src={image?.url}
                                                                width={100}
                                                                height={100}
                                                                style={{
                                                                    objectFit: "cover",
                                                                    borderRadius: "12px"
                                                                }}
                                                                className="hover:cursor-pointer"
                                                            />
                                                        }
                                                    </Upload>
                                                )
                                        }
                                    </div>
                                    <div className="grid grid-cols-[120px_minmax(0,1fr)] divide-y divide-gray-100 border-t border-b border-gray-100 text-sm">
                                        <div className="py-2.5 pr-3 text-gray-500 flex items-center whitespace-nowrap">Họ tên</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.name}</div>
                                                    )
                                                    :
                                                    (
                                                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                                                    )
                                            }
                                        </div>

                                        <div className="py-2.5 pr-3 text-gray-500 flex items-center whitespace-nowrap">Email</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.email}</div>
                                                    )
                                                    :
                                                    (
                                                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                                                    )
                                            }
                                        </div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Số điện thoại</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.phone}</div>
                                                    )
                                                    :
                                                    (
                                                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                                                    )
                                            }
                                        </div>


                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Ngày sinh</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{new Date(staffDetailData.birthday).toLocaleDateString()}</div>
                                                    )
                                                    :
                                                    (
                                                        // <Input defaultValue={new Date(staffDetailData.birthday).toLocaleDateString()} onChange={(e) => setBirthday(e.target.value)} />
                                                        <Radio.Group onChange={(e) => setGender(e.target.value)} value={gender} options={genderOptions} >
                                                        </Radio.Group>
                                                    )
                                            }
                                        </div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Giới tính</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.gender}</div>
                                                    )
                                                    :
                                                    (
                                                        <Input value={gender} onChange={(e) => setGender(e.target.value)} />
                                                    )
                                            }
                                        </div>
                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Địa chỉ</div>
                                        <div className="py-2 flex items-center">
                                            {
                                                !isEditting ?
                                                    (
                                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.address}</div>
                                                    )
                                                    :
                                                    (
                                                        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                                                    )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </>
                    )
                }
            </Spin>
        </Modal >
    );
}

export default StaffDetail;