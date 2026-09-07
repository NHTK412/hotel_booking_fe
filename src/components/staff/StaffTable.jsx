import { Button, Flex, Modal, notification, Popconfirm, Spin, Table, Tag, Tooltip } from "antd";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";
import { deleteStaff, restoreStaff } from "../../services/UserService";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
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

    const handleDeleteStaff = async (staffId) => {
        try {
            setIsLoading(true);
            await deleteStaff(listHotel[hotelCurrent]?.accommodationId, staffId);
            fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);
        } catch (error) {
            notification.error({
                title: "Lỗi",
                description: "Xóa nhân viên thất bại"
            })
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleRestoreStaff = async (staffId) => {
        try {
            setIsLoading(true);
            await restoreStaff(listHotel[hotelCurrent]?.accommodationId, staffId);
            fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, isDeleted);
        } catch (error) {
            notification.error({
                title: "Lỗi",
                description: "Khôi phục nhân viên thất bại"
            })
        }
        finally {
            setIsLoading(false);
        }
    }



    const columns = [
        {
            title: "Mã nhân viên",
            dataIndex: "id",
            key: "id"
        },
        {
            title: "Tên nhân viên",
            dataIndex: "name",
            key: "name"
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
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                if (!isDeleted) {
                    return (
                        <Flex gap="small">
                            <Tooltip title="Xem chi tiết">
                                <Button color="default" variant="filled" onClick={() => {
                                    setIsShowStaffDetail(true);
                                    setCurrentStaffId(record.id);
                                }}>
                                    <EyeOutlined />
                                </Button>
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Bạn có chắc chắn muốn xóa nhân viên này không?"
                                    onConfirm={() => handleDeleteStaff(record.id)}
                                    okText="Xóa"
                                    cancelText="Hủy">
                                    <Button color="danger" variant="filled" >
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
                            description="Bạn có chắc chắn muốn khôi phục nhân viên này không?"
                            onConfirm={() => handleRestoreStaff(record.id)}
                            okText="Khôi phục"
                            cancelText="Hủy">
                            <Button className="!bg-green-500 !border-green-500 !text-white">
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
                        total: staffPage.page.totalPages,
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