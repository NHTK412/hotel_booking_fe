import { Card, Col, Row, Statistic, Table, Tag, Button } from "antd";
import {
    HomeOutlined,
    TeamOutlined,
    BookOutlined,
    DollarCircleOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const AdminDashboardPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Tổng Quan Hệ Thống Quản Trị</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Chào mừng trở lại! Dưới đây là thông số vận hành và các tính năng quản lý toàn sàn.
                </p>
            </div>

            {/* Quick Stat Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-xs border-slate-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-slate-500 font-medium">Cơ Sở Lưu Trú</span>}
                            value={24}
                            prefix={<HomeOutlined className="text-blue-600 mr-2" />}
                            suffix={<span className="text-xs text-slate-400">cơ sở</span>}
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span></span>
                            <Button type="link" size="small" onClick={() => navigate("/admin/accommodations")}>
                                Chi tiết <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-xs border-slate-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-slate-500 font-medium">Tài Khoản Host</span>}
                            value={48}
                            prefix={<TeamOutlined className="text-emerald-600 mr-2" />}
                            suffix={<span className="text-xs text-slate-400">tài khoản</span>}
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span></span>
                            <Button type="link" size="small" onClick={() => navigate("/admin/hosts")}>
                                Cấp Host <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-xs border-slate-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-slate-500 font-medium">Tổng Đơn Toàn Sàn</span>}
                            value={1280}
                            prefix={<BookOutlined className="text-amber-500 mr-2" />}
                            suffix={<span className="text-xs text-slate-400">đơn</span>}
                        />
                        <div className="mt-2 text-xs text-slate-500">
                            <span>Tỷ lệ hoàn tất 94.2%</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-xs border-slate-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-slate-500 font-medium">Doanh Thu Toàn Hệ Thống</span>}
                            value={3450000000}
                            prefix={<DollarCircleOutlined className="text-blue-700 mr-2" />}
                            formatter={(val) =>
                                new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)
                            }
                        />
                        <div className="mt-2 text-xs text-slate-500">
                            <span className="text-emerald-600 font-medium">+18.5%</span> so với tháng trước
                        </div>
                    </Card>
                </Col>
            </Row>


        </div>
    );
};

export default AdminDashboardPage;
