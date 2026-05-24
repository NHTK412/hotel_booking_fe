import { Table } from "antd";

const StaffTable = ({
    staffPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize
}) => {


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
            key: "roleStaff"
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