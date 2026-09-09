import { Button, Flex, Modal, notification, Popconfirm, Spin, Table, Tag, Tooltip } from "antd";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";
import { deleteStaff, restoreStaff, patchStaffStatus } from "../../services/UserService";
import { DeleteOutlined, EyeOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import StaffDetail from "./StaffDetail";
import { USER_ROLE_CONFIG } from "../../config/themeConfig";

const StaffTable = ({
    staffPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize,
    isDeleted,
    setIsDeleted,
    fetchStaffByHotel
}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isShowStaffDetail, setIsShowStaffDetail] = useState(false);
    const [currentStaffId, setCurrentStaffId] = useState(null);

    const { listHotel, hotelCurrent } = useContext(globalContext);

    const handleDeleteStaff = async (record) => {
        try {
            setIsLoading(true);
            const staffId = record.accommodationStaffId || record.id;
            await deleteStaff(staffId);
            notification.success({
                message: "Thành công",
                description: `Đã xác nhận nhân viên "${record.name || 'này'}" nghỉ việc.`
            });
            fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Xử lý nhân viên nghỉ việc thất bại"
            });
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleRestoreStaff = async (record) => {
        try {
            setIsLoading(true);
            const staffId = record.accommodationStaffId || record.id;
            await restoreStaff(staffId);
            notification.success({
                message: "Thành công",
                description: `Đã khôi phục nhân viên "${record.name || 'này'}" làm việc trở lại.`
            });
            fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Khôi phục nhân viên thất bại"
            });
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleUnitStatus = async (record, newStatus) => {
        try {
            setIsLoading(true);
            const staffId = record.accommodationStaffId || record.id;
            await patchStaffStatus(staffId, newStatus);
            notification.success({
                message: newStatus === "ACTIVE" ? "Đã mở khóa nhân viên" : "Đã tạm khóa nhân viên",
                description: `Đã cập nhật trạng thái làm việc của "${record.name}" tại cơ sở này.`
            });
            fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Cập nhật trạng thái thất bại"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const columns = [
        {
            title: "Mã NV",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 80,
            render: (id, record) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    #{record.accommodationStaffId || id}
                </span>
            )
        },
        {
            title: "Tên nhân viên",
            dataIndex: "name",
            key: "name",
            render: (text) => <span className="font-medium text-slate-800">{text}</span>
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email"
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone"
        },
        {
            title: "Chức vụ",
            dataIndex: "roleStaff",
            key: "roleStaff",
            render: (role) => {
                const roleConfig = USER_ROLE_CONFIG[role];
                return (
                    <Tag color={roleConfig?.tagColor || "default"}>
                        {roleConfig?.label || role}
                    </Tag>
                );
            }
        },
        {
            title: "Trạng thái",
            key: "status",
            align: "center",
            width: 140,
            render: (_, record) => {
                if (record.isDeleted) {
                    return <Tag color="error">Đã nghỉ việc</Tag>;
                }
                if (record.status === "INACTIVE") {
                    return <Tag icon={<CloseCircleOutlined />} color="warning">Bị tạm khóa</Tag>;
                }
                return <Tag icon={<CheckCircleOutlined />} color="success">Đang làm việc</Tag>;
            }
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 150,
            render: (_, record) => {
                if (!isDeleted) {
                    const isCurrentlyActive = record.status !== "INACTIVE";

                    return (
                        <Flex gap="small" justify="center" align="center">
                            {/* Nút Xem chi tiết */}
                            <Tooltip title="Xem chi tiết">
                                <Button color="default" variant="filled" size="small" onClick={() => {
                                    setIsShowStaffDetail(true);
                                    setCurrentStaffId(record.id);
                                }}>
                                    <EyeOutlined />
                                </Button>
                            </Tooltip>

                            {/* Nút Khóa / Mở khóa tại cơ sở này */}
                            <Tooltip
                                title={
                                    isCurrentlyActive
                                        ? "Tạm khóa nhân viên tại cơ sở"
                                        : "Mở lại quyền làm việc tại cơ sở"
                                }
                            >
                                <Popconfirm
                                    title={isCurrentlyActive ? "Tạm khóa quyền làm việc?" : "Mở lại quyền làm việc?"}
                                    description={
                                        isCurrentlyActive
                                            ? `Tạm khóa quyền truy cập của "${record.name}" tại cơ sở lưu trú này?`
                                            : `Mở lại quyền truy cập cho "${record.name}" tại cơ sở lưu trú này?`
                                    }
                                    onConfirm={() => handleUnitStatus(record, isCurrentlyActive ? "INACTIVE" : "ACTIVE")}
                                    okText={isCurrentlyActive ? "Tạm khóa" : "Mở lại"}
                                    cancelText="Hủy"
                                    okButtonProps={isCurrentlyActive ? { danger: true } : { type: "primary" }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        className={
                                            isCurrentlyActive
                                                ? "text-amber-500 hover:text-amber-600"
                                                : "text-emerald-600 hover:text-emerald-700"
                                        }
                                        icon={
                                            isCurrentlyActive ? (
                                                <LockOutlined className="text-base" />
                                            ) : (
                                                <UnlockOutlined className="text-base" />
                                            )
                                        }
                                    />
                                </Popconfirm>
                            </Tooltip>

                            {/* Nút Nghỉ việc */}
                            <Tooltip title="Cho nghỉ việc">
                                <Popconfirm
                                    title="Xác nhận nhân viên nghỉ việc"
                                    description={`Xác nhận nhân viên "${record.name}" đã nghỉ việc tại cơ sở này? Nhân viên sẽ mất toàn bộ quyền truy cập.`}
                                    onConfirm={() => handleDeleteStaff(record)}
                                    okText="Nghỉ việc"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}>
                                    <Button color="danger" variant="filled" size="small">
                                        <DeleteOutlined />
                                    </Button>
                                </Popconfirm>
                            </Tooltip>
                        </Flex >
                    )
                }
                else {
                    return (
                        <Popconfirm
                            title="Xác nhận khôi phục"
                            description={`Khôi phục nhân viên "${record.name}" đi làm lại tại cơ sở này?`}
                            onConfirm={() => handleRestoreStaff(record)}
                            okText="Khôi phục"
                            cancelText="Hủy"
                            okButtonProps={{ type: "primary" }}>
                            <Button className="!bg-green-600 !border-green-600 !text-white hover:!bg-green-500" size="small">
                                Khôi phục
                            </Button>
                        </Popconfirm >
                    )
                }
            }
        }
    ];

    return (
        <>
            <Spin spinning={isLoading}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={staffPage.content}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['1', '5', '10', '20', '50'],
                        current: currentPage + 1,
                        pageSize: currentPageSize,
                        total: staffPage?.page?.totalElements || (staffPage?.page?.totalPages * currentPageSize) || 0,
                        onChange: (page, pageSize) => {
                            setCurrentPage(page - 1);
                            setCurrentPageSize(pageSize);
                        }
                    }}
                />
                <StaffDetail
                    isShowStaffDetail={isShowStaffDetail}
                    setIsShowStaffDetail={setIsShowStaffDetail}
                    staffId={currentStaffId}
                >
                </StaffDetail>
            </Spin>
        </>);
}

export default StaffTable;