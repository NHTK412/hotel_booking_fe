import { useState, useEffect } from "react";
import { Modal, Spin, Tag, Avatar, notification, Button, Descriptions } from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    StopOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
    ManOutlined,
    WomanOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { getUserById } from "../../services/UserService";
import { USER_ROLE_CONFIG } from "../../config/themeConfig";

const HostDetailModal = ({ open, onClose, staffId, hotelName, roleStaff }) => {
    const [staffData, setStaffData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && staffId) {
            fetchStaffDetail(staffId);
        } else {
            setStaffData(null);
        }
    }, [open, staffId]);

    const fetchStaffDetail = async (id) => {
        try {
            setIsLoading(true);
            const response = await getUserById(id);
            const data = response?.data || response;
            setStaffData(data);
        } catch (error) {
            console.error("Lỗi lấy thông tin chi tiết host:", error);
            notification.error({
                message: "Không thể lấy thông tin chi tiết",
                description: error?.response?.data?.message || error?.message || "Đã xảy ra lỗi.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const effectiveRole = staffData?.roleStaff || staffData?.role || roleStaff || "ROLE_MANAGER";
    const roleConfig = USER_ROLE_CONFIG[effectiveRole];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            width={620}
            centered
            title={
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <IdcardOutlined className="text-blue-600 text-lg" />
                    <span className="font-bold text-slate-800 text-base">Hồ Sơ Nhân Sự / Quản Lý</span>
                </div>
            }
        >
            <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
                {staffData ? (
                    <div className="py-3 space-y-4">
                        {/* Header card with Avatar and Identity */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <Avatar
                                size={68}
                                src={staffData.avatarUrl}
                                icon={<UserOutlined />}
                                className="bg-blue-600 border-2 border-white shadow-sm shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-slate-900 m-0 truncate">
                                        {staffData.name || "Chưa đặt tên"}
                                    </h3>
                                    <Tag color={roleConfig?.tagColor || "blue"} className="font-semibold text-xs">
                                        {roleConfig?.label || effectiveRole}
                                    </Tag>
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-1 mb-1">
                                    Mã tài khoản: #{staffData.id || staffId}
                                </p>
                                {hotelName && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                                        <HomeOutlined />
                                        <span className="truncate">{hotelName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed information */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <Descriptions
                                column={1}
                                size="small"
                                bordered
                                labelStyle={{
                                    width: "185px",
                                    whiteSpace: "nowrap",
                                    fontWeight: 600,
                                    color: "#475569",
                                    backgroundColor: "#f8fafc",
                                }}
                                contentStyle={{ color: "#1e293b" }}
                            >
                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <MailOutlined className="text-slate-400" />
                                            Email liên hệ
                                        </span>
                                    }
                                >
                                    <span className="font-mono text-xs">{staffData.email || "—"}</span>
                                </Descriptions.Item>

                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <PhoneOutlined className="text-slate-400" />
                                            Số điện thoại
                                        </span>
                                    }
                                >
                                    <span className="font-mono text-xs">{staffData.phone || "—"}</span>
                                </Descriptions.Item>

                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <CalendarOutlined className="text-slate-400" />
                                            Ngày sinh
                                        </span>
                                    }
                                >
                                    {staffData.birthday
                                        ? new Date(staffData.birthday).toLocaleDateString("vi-VN")
                                        : "Chưa cập nhật"}
                                </Descriptions.Item>

                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <UserSwitchOutlined className="text-slate-400" />
                                            Giới tính
                                        </span>
                                    }
                                >
                                    <div className="flex items-center gap-1.5">
                                        {staffData.gender === "MALE" || staffData.gender === "Nam" ? (
                                            <>
                                                <ManOutlined className="text-blue-500 text-sm" />
                                                <span>Nam</span>
                                            </>
                                        ) : staffData.gender === "FEMALE" || staffData.gender === "Nữ" ? (
                                            <>
                                                <WomanOutlined className="text-pink-500 text-sm" />
                                                <span>Nữ</span>
                                            </>
                                        ) : staffData.gender === "OTHER" || staffData.gender === "Khác" ? (
                                            <>
                                                <UserOutlined className="text-slate-400 text-sm" />
                                                <span>Khác</span>
                                            </>
                                        ) : (
                                            <span>{staffData.gender || "Chưa cập nhật"}</span>
                                        )}
                                    </div>
                                </Descriptions.Item>

                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <EnvironmentOutlined className="text-slate-400" />
                                            Địa chỉ
                                        </span>
                                    }
                                >
                                    {staffData.address || "Chưa cập nhật"}
                                </Descriptions.Item>

                                <Descriptions.Item
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <SafetyCertificateOutlined className="text-slate-400" />
                                            Trạng thái tài khoản
                                        </span>
                                    }
                                >
                                    {staffData.isDeleted ? (
                                        <Tag color="error" icon={<StopOutlined />}>
                                            Đã khóa / Tạm ngưng
                                        </Tag>
                                    ) : (
                                        <Tag color="success" icon={<CheckCircleOutlined />}>
                                            Đang hoạt động
                                        </Tag>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="py-8 text-center text-slate-400 text-sm">
                            Không có dữ liệu nhân sự.
                        </div>
                    )
                )}
            </Spin>
        </Modal>
    );
};

export default HostDetailModal;
