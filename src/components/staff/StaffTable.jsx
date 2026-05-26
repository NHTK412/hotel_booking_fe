import { Button, Flex, notification, Popconfirm, Spin, Table, Tag } from "antd";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";
import { deleteStaff, restoreStaff } from "../../services/UserService";

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

    const roleStaff = [
        {
            value: "ROLE_RECEPTIONIST",
            label: "Nhân viên",
            color: "green"
        },
        {
            value: "ROLE_MANAGER",
            label: "Quản lý",
            color: "blue"
        }
    ]

    const [isLoading, setIsLoading] = useState(false);

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
                const roleOption = roleStaff.find((r) => r.value === role);
                return (
                    <Tag color={roleOption?.color}>
                        {roleOption?.label}
                    </Tag>
                )
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                if (!isDeleted) {
                    return (
                        <Flex gap="small">
                            <div>
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Bạn có chắc chắn muốn xóa nhân viên này không?"
                                    onConfirm={() => handleDeleteStaff(record.id)}
                                    okText="Xóa"
                                    cancelText="Hủy">
                                    <Button color="danger" variant="solid">
                                        Xóa
                                    </Button>
                                </Popconfirm>

                            </div>
                            <Button className="!bg-yellow-500 !border-yellow-500 !text-white">
                                Sửa
                            </Button>

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
            </Spin>
        </>);
}

export default StaffTable;