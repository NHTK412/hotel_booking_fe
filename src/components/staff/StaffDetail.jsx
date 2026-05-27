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

    const [staffDetailData, setStaffDetailData] = useState(null);
    const [isLoadingStaffDetail, setIsLoadingStaffDetail] = useState(false);


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
            staffData.birthday = staffData.birthday ? new Date(staffData.birthday).toLocaleDateString("vi-VN") : "";
            setStaffDetailData(staffData);
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

                            </div>
                            <div className="flex flex-col gap-1.5 max-w-md mx-auto">
                                <div className=" p-6">
                                    <div className="flex justify-center mb-6">
                                        <Image
                                            src={staffDetailData.avatarUrl}
                                            alt="Avatar"
                                            width={100}
                                            height={100}
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="grid grid-cols-[1fr_2fr] divide-y divide-gray-100 border-t border-b border-gray-100 text-sm">
                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Họ tên</div>
                                        <div className="py-2.5 px-3 font-medium">{staffDetailData.name}</div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Email</div>
                                        <div className="py-2.5 px-3">{staffDetailData.email}</div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Số điện thoại</div>
                                        <div className="py-2.5 px-3">{staffDetailData.phone}</div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Ngày sinh</div>
                                        <div className="py-2.5 px-3">{staffDetailData.birthday}</div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Giới tính</div>
                                        <div className="py-2.5 px-3">{staffDetailData.gender}</div>

                                        <div className="py-2.5 text-gray-500 flex items-center gap-2">Địa chỉ</div>
                                        <div className="py-2.5 px-3">{staffDetailData.address}</div>
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