import { useContext, useState } from "react";
import { Layout, Avatar, Button, Spin } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import Navigation from "../components/Navigation";
import { Outlet } from "react-router-dom";
import SelectHotel from "../components/SelectHotel";
import { globalContext } from "../context/GlobalContext";

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    // const hotelList = [
    //     { id: 1, name: "Khách sạn ABC" },
    //     { id: 2, name: "Khách sạn XYZ" },
    //     { id: 3, name: "Khách sạn DEF" },
    // ]

    const { listHotel } = useContext(globalContext);

    // const [currentHotel, setCurrentHotel] = useState(listHotel[0]);

    const { userInfo, hotelCurrent, setHotelCurrent
        // , 
        // isLoading 
    } = useContext(globalContext);

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


                    <SelectHotel hotelList={listHotel} hotelCurrent={hotelCurrent} setHotelCurrent={setHotelCurrent} />

                    {/* {
                        isLoading ? (
                            <div className="flex justify-center items-center mr-10">
                                <Spin />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pr-4">
                                <span className="text-sm text-gray-600">{userInfo?.name}</span>
                                <Avatar src={userInfo?.avatarUrl}>
                                    <UserOutlined />
                                </Avatar>
                            </div>
                        )
                    } */}
                    <div className="flex items-center gap-3 pr-4">
                        <span className="text-sm text-gray-600">{userInfo?.name}</span>
                        <Avatar src={userInfo?.avatarUrl}>
                            <UserOutlined />
                        </Avatar>
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