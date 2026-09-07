import {
    AppstoreOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    LogoutOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { globalContext } from "../context/GlobalContext";

const AdminNavigation = ({ collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { handleLogout } = useContext(globalContext);

    const items = [
        {
            key: "/admin/dashboard",
            icon: <PieChartOutlined />,
            label: "Tổng Quan Hệ Thống",
        },
        {
            key: "/admin/accommodations",
            icon: <HomeOutlined />,
            label: "Quản Lý Khách Sạn",
        },
        {
            key: "/admin/hosts",
            icon: <TeamOutlined />,
            label: "Cấp Tài Khoản Host",
        },
        {
            key: "/admin/locations",
            icon: <EnvironmentOutlined />,
            label: "Địa Bàn & Tọa Độ",
        },
        {
            key: "/admin/profile",
            icon: <UserOutlined />,
            label: "Hồ Sơ Admin",
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng Xuất",
            danger: true,
        },
    ];

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            handleLogout();
        } else {
            navigate(e.key);
        }
    };

    return (
        <div className="px-2 py-2">
            <Menu
                mode="inline"
                theme="light"
                inlineCollapsed={collapsed}
                selectedKeys={[location.pathname]}
                items={items}
                onClick={handleMenuClick}
            />
        </div>
    );
};

export default AdminNavigation;
