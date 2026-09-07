import { Button, Card, Empty } from "antd";
import { UserAddOutlined, TeamOutlined } from "@ant-design/icons";

const AdminHostsPage = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Quản Lý & Cấp Quyền Tài Khoản Host</h1>
                    <p className="text-slate-500 text-sm">Cấp tài khoản và quyền quản lý cơ sở lưu trú cho đối tác khách sạn.</p>
                </div>
                <Button type="primary" icon={<UserAddOutlined />}>
                    Cấp Host Mới
                </Button>
            </div>
            <Card className="border-slate-200">
                <Empty
                    image={<TeamOutlined style={{ fontSize: 48, color: "#94a3b8" }} />}
                    description={
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-700">Mô-đun Cấp Tài Khoản Host (TASK-03)</p>
                            <p className="text-slate-500 text-xs">Sẵn sàng tích hợp API POST /api/users/host và quản lý danh sách người dùng.</p>
                        </div>
                    }
                />
            </Card>
        </div>
    );
};

export default AdminHostsPage;
