import { useContext, useEffect } from 'react';
import {
    BookOutlined,
    HomeOutlined,
    LogoutOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { globalContext } from '../context/GlobalContext';

const Navigation = ({ collapsed }) => {
    const { isCurrentReceptionist, handleLogout } = useContext(globalContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Tự động điều hướng ra khỏi trang quản lý nhân sự nếu cơ sở hiện tại là Lễ tân
    useEffect(() => {
        if (isCurrentReceptionist && (location.pathname === '/host/staff' || location.pathname.startsWith('/host/staff'))) {
            navigate('/host/dashboard', { replace: true });
        }
    }, [isCurrentReceptionist, location.pathname, navigate]);

    // Menu cho Lễ tân
    const itemsReceptionist = [
        { key: '/host/dashboard', icon: <PieChartOutlined />, label: 'Bảng Điều Khiển' },
        { key: '/host/rooms', icon: <HomeOutlined />, label: 'Quản Lý Phòng' },
        { key: '/host/bookings', icon: <BookOutlined />, label: 'Đơn Đặt Phòng' },
        { key: '/host/profile', icon: <UserOutlined />, label: 'Hồ Sơ Cá Nhân' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng Xuất', danger: true },
    ];

    // Menu cho Chủ khách sạn / Quản lý (đầy đủ quyền quản lý nhân sự)
    const itemsHost = [
        { key: '/host/dashboard', icon: <PieChartOutlined />, label: 'Bảng Điều Khiển' },
        { key: '/host/rooms', icon: <HomeOutlined />, label: 'Quản Lý Phòng' },
        { key: '/host/bookings', icon: <BookOutlined />, label: 'Đơn Đặt Phòng' },
        { key: '/host/staff', icon: <TeamOutlined />, label: 'Quản Lý Nhân Sự' },
        { key: '/host/profile', icon: <UserOutlined />, label: 'Hồ Sơ Cá Nhân' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng Xuất', danger: true },
    ];

    const menuItems = isCurrentReceptionist ? itemsReceptionist : itemsHost;

    const handleMenuClick = (e) => {
        if (e.key === 'logout') {
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
                items={menuItems}
                selectedKeys={[location.pathname]}
                onClick={handleMenuClick}
            />
        </div>
    );
};

export default Navigation;