import { useState } from "react";
import { Layout, Avatar, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import Navigation from "../components/Navigation";
import { Outlet } from "react-router-dom";
import SelectHotel from "../components/SelectHotel";

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    const hotelList = [
        { id: 1, name: "Khách sạn ABC" },
        { id: 2, name: "Khách sạn XYZ" },
        { id: 3, name: "Khách sạn DEF" },
    ]

    const [currentHotel, setCurrentHotel] = useState(hotelList[0]);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(val) => setCollapsed(val)}
                breakpoint="lg"
                collapsedWidth={64}
                width={256}
                theme="light"
            >
                <div className="flex items-center justify-center h-16 text-xl font-bold ">
                    {!collapsed ? "Hotel-Admin" : "HA"}
                </div>
                <Navigation collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </Sider>

            <Layout>
                <Header
                    className="flex items-center justify-between px-4 shadow-sm"
                    style={{
                        padding: 0,
                        background: '#fff'
                    }}
                >
                    {/* <div className="flex items-center gap-4 px-4">
                        {collapsed ? (
                            <MenuUnfoldOutlined className="text-lg cursor-pointer" onClick={() => setCollapsed(false)} />
                        ) : (
                            <MenuFoldOutlined className="text-lg cursor-pointer" onClick={() => setCollapsed(true)} />
                        )}
                        <h1 className="text-lg font-semibold m-0">Dashboard</h1>
                    </div> */}

                    {/* <div className="text-lg ml-5 cursor-pointer bg-blue-100 px-10 py-2 rounded-lg text-blue-300">
                        Khách sạn ABC
                    </div> */}

                    <SelectHotel hotelList={hotelList} currentHotel={currentHotel} setCurrentHotel={setCurrentHotel} />

                    <div className="flex items-center gap-3 pr-4">
                        <span className="text-sm text-gray-600">Admin</span>
                        <Avatar icon={<UserOutlined />} />
                    </div>
                </Header>

                <Content
                    className="p-6 bg-gray-100 min-h-screen"
                    theme="light"
                >
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* {children || <h2 className="text-2xl font-medium">Welcome to the Dashboard</h2>} */}
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;