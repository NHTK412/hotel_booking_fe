import { useContext, useState } from "react";
import { Layout, Avatar, Tag, Button, Tooltip } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    CrownFilled
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import AdminNavigation from "../components/AdminNavigation";
import { globalContext } from "../context/GlobalContext";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { userInfo, handleLogout } = useContext(globalContext);

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
                    <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        HB
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm tracking-wide">HOTEL ADMIN</span>
                            <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Hệ thống toàn sàn</span>
                        </div>
                    )}
                </div>

                <AdminNavigation collapsed={collapsed} />
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
                        <span className="font-semibold text-slate-700 hidden sm:inline">
                            Cổng Quản Trị Hệ Thống Toàn Sàn
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Tag color="error" className="font-semibold px-2 py-0.5" icon={<CrownFilled />}>
                            ROLE_ADMIN
                        </Tag>

                        <div className="flex items-center gap-2">
                            <Avatar
                                src={userInfo?.avatarUrl}
                                icon={<UserOutlined />}
                                className="bg-blue-600 border border-slate-200 shadow-xs"
                            />
                            <span className="text-sm font-medium text-slate-700 hidden md:inline">
                                {userInfo?.name || "Administrator"}
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

export default AdminLayout;
