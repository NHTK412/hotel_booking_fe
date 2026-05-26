import { Button, Flex, Popconfirm, Table, Tag } from "antd";

const StaffTable = ({
    staffPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize
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
                return (
                    <Flex gap="small">
                        <div>
                            <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa nhân viên này không?"
                                onConfirm={async () => {
                                    try {
                                    } catch (error) {
                                    }
                                }}
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
        }
    ];

    return (
        <>
            <Table
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
        </>);
}

export default StaffTable;