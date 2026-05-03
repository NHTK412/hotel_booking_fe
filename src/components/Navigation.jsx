import React, { useState } from 'react';
import {
    AppstoreOutlined,
    BookOutlined,
    ContainerOutlined,
    DesktopOutlined,
    HomeOutlined,
    HomeTwoTone,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ collapsed: collapsedProp, onToggle }) => {

    const items = [
        { key: '1', icon: <PieChartOutlined />, label: 'Trang Chủ', path: "/" },
        // { key: '2', icon: <SolutionOutlined />, label: 'Thông Tin Khách Sạn', path: "/hotels" },
        { key: '3', icon: <UserOutlined />, label: 'Thông Tin Nhân Viên', path: "/me" },
        { key: '4', icon: <HomeOutlined />, label: 'Danh Sách Phòng', path: "/rooms" },
        { key: '5', icon: <BookOutlined />, label: 'Danh Sách Đặt Phòng', path: "/bookings" },
    ];


    const path = window.location.pathname;
    const currentPath = items.find(item => item.path === path);
    const [current, setCurrent] = useState(currentPath ? currentPath.key : '1');

    const navigate = useNavigate();



    const handleMenuClick = (e) => {
        const item = items.find(item => item.key === e.key);
        if (item) {
            navigate(item.path);
            setCurrent(e.key);
        }
    };

    return (
        <div className="px-2">
            <Menu
                mode="inline"
                theme="light"
                inlineCollapsed={collapsedProp}
                items={items}
                selectedKeys={[current]}
                onClick={handleMenuClick}

            />
        </div>
    );
}

export default Navigation;