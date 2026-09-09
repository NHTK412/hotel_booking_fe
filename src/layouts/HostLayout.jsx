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
        selectedAccommodationId,
        currentHotel,
        isCurrentReceptionist,
        handleLogout
    } = useContext(globalContext);

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
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        <ShopOutlined />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-slate-800 text-sm tracking-wide truncate">
                                {selectedAccommodationId && currentHotel ? currentHotel.accommodationName : "Tất Cả Cơ Sở"}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                {isCurrentReceptionist ? (
                                    <Tag color="orange" className="text-[10px] leading-[16px] px-1.5 py-0 m-0 font-medium">
                                        LỄ TÂN
                                    </Tag>
                                ) : (
                                    <Tag color="blue" className="text-[10px] leading-[16px] px-1.5 py-0 m-0 font-medium">
                                        {!selectedAccommodationId ? "QUẢN LÝ TẤT CẢ" : "QUẢN LÝ"}
                                    </Tag>
                                )}
                            </div>
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
                        {isCurrentReceptionist ? (
                            <Tag color="orange" className="font-semibold px-2.5 py-1 text-xs">
                                LỄ TÂN
                            </Tag>
                        ) : (
                            <Tag color="geekblue" className="font-semibold px-2.5 py-1 text-xs">
                                {!selectedAccommodationId ? "QUẢN TRỊ TẤT CẢ CƠ SỞ" : "QUẢN LÝ"}
                            </Tag>
                        )}

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
