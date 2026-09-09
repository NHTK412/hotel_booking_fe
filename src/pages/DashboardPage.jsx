import { useContext, useEffect, useState, useCallback } from "react";
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
    Statistic,
    Spin,
    Empty,
    Tag,
    Tooltip,
    notification,
} from "antd";
import {
    UsergroupAddOutlined,
    CalendarOutlined,
    DollarOutlined,
    RiseOutlined,
    ReloadOutlined,
    ShopOutlined,
    PieChartOutlined,
    BarChartOutlined,
    FileDoneOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/charts";
import dayjs from "dayjs";
import { globalContext } from "../context/GlobalContext";
import {
    getTodayGuests,
    getTodayCheckins,
    getTodayRevenue,
    getMonthRevenue,
    getMonthlyRevenue,
    getRevenueByRoomType,
    getBookingStatistics,
    getTotalNights,
} from "../services/BookingService";

const { RangePicker } = DatePicker;

const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);
};

const DashboardPage = () => {
    const { listHotel, currentHotel: contextHotel, selectedAccommodationId } = useContext(globalContext);
    // Nếu chọn Tất cả cơ sở, tự động hiển thị cơ sở đầu tiên cho báo cáo số liệu
    const currentHotel = contextHotel || listHotel?.[0] || null;

    // Năm phân tích biểu đồ tháng
    const [selectedYear, setSelectedYear] = useState(dayjs().year());

    // Khoảng ngày lọc báo cáo tổng hợp
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    // Trạng thái dữ liệu KPI
    const [todayGuests, setTodayGuests] = useState(0);
    const [todayCheckins, setTodayCheckins] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [monthRevenue, setMonthRevenue] = useState(0);
    const [isLoadingKPI, setIsLoadingKPI] = useState(false);

    // Trạng thái Biểu đồ
    const [monthlyData, setMonthlyData] = useState([]);
    const [roomTypeData, setRoomTypeData] = useState([]);
    const [isLoadingCharts, setIsLoadingCharts] = useState(false);

    // Trạng thái Báo cáo kỳ chọn
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalCanceled: 0,
        totalRevenue: 0,
        averageValue: 0,
        totalNights: 0,
    });
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // 1. Tải 4 KPI trong ngày và tháng
    const fetchKPIs = useCallback(async (hotelId) => {
        try {
            setIsLoadingKPI(true);
            const [guestsRes, checkinsRes, todayRevRes, monthRevRes] = await Promise.allSettled([
                getTodayGuests(hotelId),
                getTodayCheckins(hotelId),
                getTodayRevenue(hotelId),
                getMonthRevenue(hotelId),
            ]);

            setTodayGuests(guestsRes.status === "fulfilled" ? Number(guestsRes.value?.data ?? guestsRes.value ?? 0) : 0);
            setTodayCheckins(checkinsRes.status === "fulfilled" ? Number(checkinsRes.value?.data ?? checkinsRes.value ?? 0) : 0);
            setTodayRevenue(todayRevRes.status === "fulfilled" ? Number(todayRevRes.value?.data ?? todayRevRes.value ?? 0) : 0);
            setMonthRevenue(monthRevRes.status === "fulfilled" ? Number(monthRevRes.value?.data ?? monthRevRes.value ?? 0) : 0);
        } catch (error) {
            console.error("Lỗi tải KPI hôm nay:", error);
        } finally {
            setIsLoadingKPI(false);
        }
    }, []);

    // 2. Tải dữ liệu biểu đồ doanh thu 12 tháng & theo loại phòng
    const fetchCharts = useCallback(async (hotelId, year, start, end) => {
        try {
            setIsLoadingCharts(true);
            const startDateStr = start.format("YYYY-MM-DD");
            const endDateStr = end.format("YYYY-MM-DD");

            const [monthlyRes, roomTypeRes] = await Promise.allSettled([
                getMonthlyRevenue(hotelId, year),
                getRevenueByRoomType(hotelId, startDateStr, endDateStr),
            ]);

            // Chuẩn hóa dữ liệu 12 tháng (Tháng 1 -> Tháng 12)
            const default12Months = Array.from({ length: 12 }, (_, i) => ({
                month: `Tháng ${i + 1}`,
                monthIndex: i + 1,
                revenue: 0,
            }));

            if (monthlyRes.status === "fulfilled") {
                const rawList = monthlyRes.value?.data || monthlyRes.value || [];
                if (Array.isArray(rawList)) {
                    rawList.forEach((item) => {
                        const mIndex = Number(item.month || item.monthIndex || 0);
                        const rev = Number(item.revenue || item.totalRevenue || item.amount || 0);
                        if (mIndex >= 1 && mIndex <= 12) {
                            default12Months[mIndex - 1].revenue = rev;
                        }
                    });
                }
            }
            setMonthlyData(default12Months);

            // Chuẩn hóa dữ liệu doanh thu loại phòng
            if (roomTypeRes.status === "fulfilled") {
                const rawRoomTypes = roomTypeRes.value?.data || roomTypeRes.value || [];
                if (Array.isArray(rawRoomTypes)) {
                    const formatted = rawRoomTypes
                        .map((item) => ({
                            roomTypeName: item.roomTypeName || item.name || `Loại #${item.roomTypeId}`,
                            revenue: Number(item.revenue || item.totalRevenue || 0),
                        }))
                        .filter((item) => item.revenue > 0);
                    setRoomTypeData(formatted);
                } else {
                    setRoomTypeData([]);
                }
            } else {
                setRoomTypeData([]);
            }
        } catch (error) {
            console.error("Lỗi tải biểu đồ doanh thu:", error);
        } finally {
            setIsLoadingCharts(false);
        }
    }, []);

    // 3. Tải báo cáo vận hành trong khoảng ngày chọn
    const fetchDateRangeReport = useCallback(async (hotelId, start, end) => {
        try {
            setIsLoadingStats(true);
            const startDateStr = start.format("YYYY-MM-DD");
            const endDateStr = end.format("YYYY-MM-DD");

            const [statsRes, nightsRes] = await Promise.allSettled([
                getBookingStatistics(hotelId, startDateStr, endDateStr),
                getTotalNights(hotelId, startDateStr, endDateStr),
            ]);

            let statData = {
                totalBookings: 0,
                totalCanceled: 0,
                totalRevenue: 0,
                averageValue: 0,
                totalNights: 0,
            };

            if (statsRes.status === "fulfilled") {
                const data = statsRes.value?.data || statsRes.value || {};
                statData.totalBookings = Number(data.totalBookings || 0);
                statData.totalCanceled = Number(data.totalCanceled || data.canceledBookings || 0);
                statData.totalRevenue = Number(data.totalRevenue || 0);
                statData.averageValue = Number(data.averageValue || data.averageOrderValue || 0);
            }

            if (nightsRes.status === "fulfilled") {
                statData.totalNights = Number(nightsRes.value?.data ?? nightsRes.value ?? 0);
            }

            setStats(statData);
        } catch (error) {
            console.error("Lỗi tải báo cáo kỳ:", error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // Tải toàn bộ dữ liệu khi khách sạn hiện tại hoặc bộ lọc thay đổi
    const loadAllDashboardData = useCallback(() => {
        if (!currentHotel?.accommodationId) return;
        const id = currentHotel.accommodationId;
        fetchKPIs(id);
        fetchCharts(id, selectedYear, dateRange[0], dateRange[1]);
        fetchDateRangeReport(id, dateRange[0], dateRange[1]);
    }, [currentHotel, selectedYear, dateRange, fetchKPIs, fetchCharts, fetchDateRangeReport]);

    useEffect(() => {
        loadAllDashboardData();
    }, [loadAllDashboardData]);

    const handleRangeChange = (dates) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange(dates);
        }
    };

    const rangePresets = [
        { label: "7 ngày qua", value: [dayjs().subtract(7, "d"), dayjs()] },
        { label: "30 ngày qua", value: [dayjs().subtract(30, "d"), dayjs()] },
        { label: "Tháng này", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
        { label: "Tháng trước", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
        { label: "Năm nay", value: [dayjs().startOf("year"), dayjs().endOf("year")] },
    ];

    if (!currentHotel?.accommodationId) {
        return (
            <Card className="border-slate-200 text-center py-12">
                <Empty
                    image={<ShopOutlined style={{ fontSize: 56, color: "#94a3b8" }} />}
                    description={
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-700">Chưa có cơ sở lưu trú</h3>
                            <p className="text-slate-500 text-xs">
                                Tài khoản của bạn hiện chưa được phân công phụ trách cơ sở lưu trú nào để thống kê doanh thu.
                            </p>
                        </div>
                    }
                />
            </Card>
        );
    }

    const cancelRate = stats.totalBookings > 0
        ? ((stats.totalCanceled / stats.totalBookings) * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800 m-0">
                            {currentHotel.accommodationName}
                        </h1>
                        <Tag color="blue" className="font-semibold text-xs m-0">
                            Mã #{currentHotel.accommodationId}
                        </Tag>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Trung tâm điều hành doanh thu, lưu trú và phân tích hiệu suất kinh doanh khách sạn.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        icon={<ReloadOutlined spin={isLoadingKPI || isLoadingCharts} />}
                        onClick={loadAllDashboardData}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* 4 Thẻ KPI Real-time */}
            <Row gutter={[16, 16]}>
                {/* Khách lưu trú hôm nay */}
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow" bodyStyle={{ padding: "16px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-medium text-slate-500 block">
                                    Khách Đang Lưu Trú
                                </span>
                                <div className="mt-1">
                                    {isLoadingKPI ? (
                                        <Spin size="small" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-800">
                                            {todayGuests} <span className="text-xs font-normal text-slate-400">Khách</span>
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                    Thời gian thực hôm nay
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                                <UsergroupAddOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Lượt Check-in hôm nay */}
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow" bodyStyle={{ padding: "16px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-medium text-slate-500 block">
                                    Lượt Nhận Phòng (Check-in)
                                </span>
                                <div className="mt-1">
                                    {isLoadingKPI ? (
                                        <Spin size="small" />
                                    ) : (
                                        <span className="text-2xl font-bold text-cyan-600">
                                            {todayCheckins} <span className="text-xs font-normal text-slate-400">Lượt</span>
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                    Theo lịch trình hôm nay
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl shadow-xs">
                                <CalendarOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Doanh thu hôm nay */}
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow" bodyStyle={{ padding: "16px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-medium text-slate-500 block">
                                    Doanh Thu Hôm Nay
                                </span>
                                <div className="mt-1">
                                    {isLoadingKPI ? (
                                        <Spin size="small" />
                                    ) : (
                                        <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                                            {formatVND(todayRevenue)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                    Phát sinh trong ngày
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                                <DollarOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Doanh thu tháng này */}
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow" bodyStyle={{ padding: "16px" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-medium text-slate-500 block">
                                    Doanh Thu Tháng Này
                                </span>
                                <div className="mt-1">
                                    {isLoadingKPI ? (
                                        <Spin size="small" />
                                    ) : (
                                        <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                                            {formatVND(monthRevenue)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                    Tháng {dayjs().month() + 1}/{dayjs().year()}
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-xs">
                                <RiseOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Khu Vực Biểu Đồ (2 Cột) */}
            <Row gutter={[16, 16]}>
                {/* Biểu đồ Cột: Doanh thu 12 tháng */}
                <Col xs={24} lg={15}>
                    <Card
                        className="border-slate-200 shadow-xs h-full"
                        title={
                            <div className="flex items-center gap-2">
                                <BarChartOutlined className="text-blue-600" />
                                <span className="text-sm font-bold text-slate-800">
                                    Biểu Đồ Doanh Thu 12 Tháng
                                </span>
                            </div>
                        }
                        extra={
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Năm:</span>
                                <Select
                                    value={selectedYear}
                                    onChange={(y) => setSelectedYear(y)}
                                    size="small"
                                    style={{ width: 90 }}
                                    options={[
                                        { value: 2024, label: "2024" },
                                        { value: 2025, label: "2025" },
                                        { value: 2026, label: "2026" },
                                        { value: 2027, label: "2027" },
                                    ]}
                                />
                            </div>
                        }
                    >
                        {isLoadingCharts ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <Spin tip="Đang tải dữ liệu biểu đồ..." />
                            </div>
                        ) : monthlyData.length > 0 ? (
                            <Column
                                data={monthlyData}
                                xField="month"
                                yField="revenue"
                                height={300}
                                style={{
                                    radiusTopLeft: 6,
                                    radiusTopRight: 6,
                                    fill: "#2563eb",
                                }}
                                axis={{
                                    y: {
                                        labelFormatter: (val) =>
                                            Number(val) >= 1000000
                                                ? `${(Number(val) / 1000000).toFixed(0)}Tr`
                                                : `${Number(val)}`,
                                    },
                                }}
                                tooltip={{
                                    items: [
                                        {
                                            channel: "y",
                                            name: "Doanh thu",
                                            valueFormatter: (val) => formatVND(val),
                                        },
                                    ],
                                }}
                            />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <Empty description="Chưa có dữ liệu doanh thu trong năm này" />
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Biểu đồ Donut: Cơ cấu doanh thu theo loại phòng */}
                <Col xs={24} lg={9}>
                    <Card
                        className="border-slate-200 shadow-xs h-full"
                        title={
                            <div className="flex items-center gap-2">
                                <PieChartOutlined className="text-emerald-600" />
                                <span className="text-sm font-bold text-slate-800">
                                    Cơ Cấu Doanh Thu Loại Phòng
                                </span>
                            </div>
                        }
                    >
                        {isLoadingCharts ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <Spin tip="Đang phân tích..." />
                            </div>
                        ) : roomTypeData.length > 0 ? (
                            <Pie
                                data={roomTypeData}
                                angleField="revenue"
                                colorField="roomTypeName"
                                innerRadius={0.6}
                                height={300}
                                legend={{
                                    color: {
                                        position: "bottom",
                                        layout: { justifyContent: "center" },
                                    },
                                }}
                                tooltip={{
                                    items: [
                                        {
                                            channel: "y",
                                            name: "Doanh thu",
                                            valueFormatter: (val) => formatVND(val),
                                        },
                                    ],
                                }}
                            />
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-center p-4">
                                <Empty description="Chưa có doanh thu phát sinh theo loại phòng trong khoảng thời gian đã chọn." />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Báo Cáo Vận Hành Trong Khoảng Thời Gian Đã Chọn */}
            <Card
                className="border-slate-200 shadow-xs"
                title={
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1">
                        <div className="flex items-center gap-2">
                            <FileDoneOutlined className="text-blue-600" />
                            <span className="text-sm font-bold text-slate-800">
                                Tổng Hợp Chỉ Số Vận Hành Theo Kỳ
                            </span>
                        </div>
                        <RangePicker
                            value={dateRange}
                            onChange={handleRangeChange}
                            presets={rangePresets}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            className="w-full sm:w-auto"
                        />
                    </div>
                }
            >
                {isLoadingStats ? (
                    <div className="py-8 text-center">
                        <Spin tip="Đang tính toán chỉ số báo cáo kỳ..." />
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6} lg={4}>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                <span className="text-xs text-slate-500 block mb-1">Tổng Lượt Đặt</span>
                                <span className="text-xl font-bold text-slate-800">
                                    {stats.totalBookings}
                                </span>
                                <span className="text-[11px] text-slate-400 block mt-0.5">đơn đặt phòng</span>
                            </div>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                            <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                                <span className="text-xs text-red-600 font-medium block mb-1">Số Đơn Bị Hủy</span>
                                <span className="text-xl font-bold text-red-600">
                                    {stats.totalCanceled}
                                </span>
                                <span className="text-[11px] text-red-400 block mt-0.5">
                                    Tỷ lệ: {cancelRate}%
                                </span>
                            </div>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                <span className="text-xs text-blue-700 font-medium block mb-1">Số Đêm Lưu Trú</span>
                                <span className="text-xl font-bold text-blue-700">
                                    {stats.totalNights}
                                </span>
                                <span className="text-[11px] text-blue-500 block mt-0.5">tổng đêm phòng</span>
                            </div>
                        </Col>

                        <Col xs={12} sm={6} lg={6}>
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                <span className="text-xs text-emerald-800 font-medium block mb-1">Tổng Doanh Thu Kỳ</span>
                                <span className="text-xl font-bold text-emerald-700">
                                    {formatVND(stats.totalRevenue)}
                                </span>
                                <span className="text-[11px] text-emerald-600 block mt-0.5">theo đơn hoàn tất</span>
                            </div>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                                <span className="text-xs text-purple-800 font-medium block mb-1">Giá Trị Đơn Trung Bình</span>
                                <span className="text-xl font-bold text-purple-700">
                                    {formatVND(stats.averageValue)}
                                </span>
                                <span className="text-[11px] text-purple-500 block mt-0.5">AOV mỗi đơn</span>
                            </div>
                        </Col>
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;