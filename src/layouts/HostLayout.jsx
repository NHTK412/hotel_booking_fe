import { useContext, useState } from "react";
import { Layout, Avatar, Tag, Button, Tooltip } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    ShopOutlined
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import SelectHotel from "../components/SelectHotel";
import { globalContext } from "../context/GlobalContext";

const { Header, Sider, Content } = Layout;

const HostLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const {
        userInfo,
        listHotel,
        hotelCurrent,
        setHotelCurrent,
        handleLogout
    } = useContext(globalContext);

    const currentHotel = listHotel?.[hotelCurrent];
    const staffRole = currentHotel?.staffRole || "ROLE_HOST";

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(val) => setCollapsed(val)}
                breakpoint="lg"
                collapsedWidth={64}
                width={260}
                theme="light"
                className="border-r border-slate-200"
            >
                <div className="flex items-center justify-center h-16 border-b border-slate-100 gap-2 px-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        <ShopOutlined />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-slate-800 text-sm tracking-wide truncate">
                                {currentHotel?.accommodationName || "Tất Cả Cơ Sở"}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                                {currentHotel ? "Cơ Sở Đang Chọn" : "Quản Trị Đa Cơ Sở"}
                            </span>
                        </div>
                    )}
                </div>

                <Navigation collapsed={collapsed} />
            </Sider>

            <Layout>
                <Header
                    className="flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-xs"
                    style={{ height: 64, padding: "0 24px" }}
                >
                    <div className="flex items-center gap-3">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-slate-600 hover:text-blue-700"
                        />
                        {listHotel && listHotel.length > 0 && (
                            <SelectHotel />
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Tag color="geekblue" className="font-semibold px-2 py-0.5">
                            {staffRole === "ROLE_RECEPTIONIST" ? "LỄ TÂN" : "CHỦ KHÁCH SẠN"}
                        </Tag>

                        <div className="flex items-center gap-2">
                            <Avatar
                                src={userInfo?.avatarUrl}
                                icon={<UserOutlined />}
                                className="bg-blue-600 border border-slate-200 shadow-xs"
                            />
                            <span className="text-sm font-medium text-slate-700 hidden md:inline">
                                {userInfo?.name || "Host Manager"}
                            </span>
                        </div>

                        <Tooltip title="Đăng xuất">
                            <Button
                                type="text"
                                danger
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                            />
                        </Tooltip>
                    </div>
                </Header>

                <Content className="p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default HostLayout;
