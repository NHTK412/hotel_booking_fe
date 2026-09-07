import { Button, Card, Empty } from "antd";
import { PlusOutlined, HomeOutlined } from "@ant-design/icons";

const AdminAccommodationsPage = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Quản Trị Cơ Sở Lưu Trú</h1>
                    <p className="text-slate-500 text-sm">Danh sách toàn bộ khách sạn, resort, homestay trên hệ thống.</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />}>
                    Thêm Khách Sạn Mới
                </Button>
            </div>
            <Card className="border-slate-200">
                <Empty
                    image={<HomeOutlined style={{ fontSize: 48, color: "#94a3b8" }} />}
                    description={
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-700">Mô-đun Quản Trị Khách Sạn (TASK-02)</p>
                            <p className="text-slate-500 text-xs">Sẵn sàng tích hợp API CRUD Accommodations, Bản đồ Geocoding Leaflet và Cloudinary CDN.</p>
                        </div>
                    }
                />
            </Card>
        </div>
    );
};

export default AdminAccommodationsPage;
