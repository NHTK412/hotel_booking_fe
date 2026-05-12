import { Button, Table, Tag } from "antd";
import { act } from "react";

const BookingTable = ({
    bookingPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize
}) => {
    const statusEnum = [
        {
            value: "WAITING_FOR_PAYMENT",
            label: "Chờ thanh toán",
            color: "orange"
        },
        {
            value: "PENDING",
            label: "Chờ nhận phòng",
            color: "blue"
        },
        {
            value: "CHECKED_IN",
            label: "Đã nhận phòng",
            color: "green"
        },
        {
            value: "CHECKED_OUT",
            label: "Đã trả phòng",
            color: "gray"
        },
        {
            value: "CANCELED",
            label: "Đã hủy",
            color: "red"
        }
    ]

    const renderButtonAction = (record) => {
        switch (record.status) {
            case "PENDING":
                return (
                    <>
                        <Button color="primary" variant="solid" size="small">Nhận phòng</Button>
                        <Button color="default" variant="solid" size="small">Hủy đặt phòng</Button>
                    </>)
            case "CHECKED_IN":
                return (
                    <>
                        <Button color="danger" variant="solid" size="small">Trả phòng</Button>
                    </>)
            default:
                return (
                    <></>
                );
        }
    }

    const columns = [
        {
            title: "Mã đặt phòng",
            dataIndex: "bookingId",
            key: "bookingId"
        },
        {
            title: "Tên khách hàng",
            dataIndex: "customerName",
            key: "customerName"
        },
        {
            title: "Email khách hàng",
            dataIndex: "customerEmail",
            key: "customerEmail"
        },
        {
            title: "Số điện thoại khách hàng",
            dataIndex: "customerPhone",
            key: "customerPhone"
        },
        {
            title: "Ngày nhận phòng",
            dataIndex: "checkInAt",
            key: "checkInAt",
            render: (checkInAt) => checkInAt ? new Date(checkInAt).toLocaleDateString() : "Chưa nhận phòng"
        },
        {
            title: "Ngày trả phòng",
            dataIndex: "checkOutAt",
            key: "checkOutAt",
            render: (checkOutAt) => checkOutAt ? new Date(checkOutAt).toLocaleDateString() : "Chưa trả phòng"
        },
        {
            title: "Tổng tiền",
            dataIndex: "finalPrice",
            key: "finalPrice",
            render: (finalPrice) => finalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                return <Tag color={statusEnum.find(s => s.value === status)?.color}>{statusEnum.find(s => s.value === status)?.label}</Tag>
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                return (
                    <div className="flex gap-2">
                        {renderButtonAction(record)}
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <Table
                rowKey="bookingId"
                columns={columns}
                dataSource={bookingPage.content}
                pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ['1', '5', '10', '20', '50'],
                    current: currentPage + 1,
                    pageSize: currentPageSize,
                    total: bookingPage.page.totalPages,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page - 1);
                        setCurrentPageSize(pageSize);
                    }
                }}
            >
            </Table>
        </>
    );
}

export default BookingTable;