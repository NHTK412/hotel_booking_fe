import { Card, Empty } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const AdminLocationsPage = () => {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold text-slate-800">Quản Lý Địa Bàn & Tọa Độ Địa Lý</h1>
                <p className="text-slate-500 text-sm">Danh mục tỉnh/thành phố, quận/huyện và tính toán khoảng cách Geohash.</p>
            </div>
            <Card className="border-slate-200">
                <Empty
                    image={<EnvironmentOutlined style={{ fontSize: 48, color: "#94a3b8" }} />}
                    description={
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-700">Mô-đun Quản Lý Địa Điểm (TASK-04)</p>
                            <p className="text-slate-500 text-xs">Sẵn sàng tích hợp API GET /api/locations/search và Bản đồ định vị.</p>
                        </div>
                    }
                />
            </Card>
        </div>
    );
};

export default AdminLocationsPage;
