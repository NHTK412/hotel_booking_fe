import { Button, Table, Tag, Space, Tooltip } from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    LoginOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { BOOKING_STATUS_CONFIG } from "../../config/themeConfig";

const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

const BookingTable = ({
    bookingPage,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize,
    isLoading = false,
}) => {
    const renderButtonAction = (record) => {
        switch (record.status) {
            case "PENDING":
                return (
                    // <Space size="small">
                    //     <Button type="primary" size="small">
                    //         <CheckCircleOutlined></CheckCircleOutlined>
                    //     </Button>
                    //     <Button icon={<CloseCircleOutlined />} size="small">
                    //         Hủy đơn
                    //     </Button>
                    // </Space>
                    <Space size="small">
                        <Tooltip title="Nhận phòng">
                            <Button type="text" icon={<LoginOutlined className="!text-green-600 !text-base" />} >
                            </Button>
                        </Tooltip>
                        <Tooltip title="Hủy đơn">
                            <Button type="text" icon={<CloseCircleOutlined className="!text-red-600 !text-base" />} >
                            </Button>
                        </Tooltip>
                    </Space>
                );
            case "CHECKED_IN":
                return (
                    <Space size="small">
                        <Tooltip title="Trả phòng">
                            <Button type="text" icon={<LogoutOutlined className="!text-blue-600 !text-base" />} >
                            </Button>
                        </Tooltip>
                    </Space>
                );
            default:
                return null;
        }
    };

    const columns = [
        {
            title: "Mã",
            dataIndex: "bookingId",
            key: "bookingId",
            width: 90,
            align: "center",
            render: (id) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    #{id}
                </span>
            ),
        },
        {
            title: "Tên khách hàng",
            key: "customerName",
            width: 200,
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">
                        {record.customerName || "Khách vãng lai"}
                    </span>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "customerPhone",
            key: "customerPhone",
            width: 150,
            render: (phone, _) => (
                <div className="flex flex-col">

                    <span className="text-xs text-slate-500">{phone || "—"}</span>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "customerEmail",
            key: "customerEmail",
            width: 200,
            render: (email, _) => (
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500">{email || "—"}</span>

                </div>
            ),
        },
        {
            title: "Cơ sở & Hạng phòng",
            key: "accommodationAndRoom",
            width: 240,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    {record.accommodationName && (
                        <div className="flex items-center gap-1.5">
                            <Tag color="cyan" className="text-[11px] m-0 font-medium truncate max-w-[200px]">
                                {record.accommodationName}
                            </Tag>
                        </div>
                    )}
                    <span className="font-semibold text-slate-700 text-xs line-clamp-1">
                        {record.roomTypeName || "Phòng tiêu chuẩn"}
                    </span>
                    {record.roomNumber && (
                        <span className="text-[11px] text-slate-500 font-mono">
                            Số phòng: <strong className="text-slate-700">#{record.roomNumber}</strong>
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: "Thời gian lưu trú",
            key: "stayDates",
            width: 170,
            render: (_, record) => {
                const inDate = record.checkInDate || record.checkInAt;
                const outDate = record.checkOutDate || record.checkOutAt;
                return (
                    <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-emerald-700 font-medium">
                            Vào: {formatDate(inDate)}
                        </span>
                        <span className="text-amber-700 font-medium">
                            Ra: {formatDate(outDate)}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Tổng thanh toán",
            dataIndex: "finalPrice",
            key: "finalPrice",
            width: 140,
            align: "right",
            render: (finalPrice, record) => (
                <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-800 text-sm">
                        {formatVND(finalPrice)}
                    </span>
                    {Number(record.discountedPrice) > 0 && (
                        <span className="text-[11px] text-red-500">
                            Giảm: -{formatVND(record.discountedPrice)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            align: "center",
            render: (status) => {
                const config = BOOKING_STATUS_CONFIG[status] || {
                    tagColor: "default",
                    label: status || "Không xác định",
                };
                return (
                    <Tag color={config.tagColor} className="font-medium text-xs px-2 py-0.5">
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            align: "center",
            render: (_, record) => renderButtonAction(record),
        },
    ];

    const content = bookingPage?.content || [];
    const totalItems = Number(
        bookingPage?.page?.totalElements ??
        bookingPage?.page?.totalPages ??
        content.length
    );

    return (
        <Table
            rowKey="bookingId"
            columns={columns}
            dataSource={content}
            loading={isLoading}
            scroll={{ x: 1100 }}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                current: currentPage + 1,
                pageSize: currentPageSize,
                total: totalItems,
                onChange: (page, pageSize) => {
                    setCurrentPage(page - 1);
                    setCurrentPageSize(pageSize);
                },
                showTotal: (total) => `Tổng cộng ${total} đơn đặt phòng`,
            }}
        />
    );
};

export default BookingTable;
