import { Button, Checkbox, Form, Input, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { login } from "../services/AuthService";
import { globalContext } from "../context/GlobalContext";
import { clearAuthData } from "../config/AxiosConfig";

const LoginPage = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { initUserData } = useContext(globalContext) || {};

    const handleLogin = async (values) => {
        const { username, password, remember } = values;
        try {
            setIsSubmitting(true);
            const response = await login(username, password);

            const authData = response?.data;
            if (authData && authData.accessToken) {
                clearAuthData();

                const storage = remember ? localStorage : sessionStorage;
                storage.setItem("accessToken", authData.accessToken);
                if (authData.refreshToken) {
                    storage.setItem("refreshToken", authData.refreshToken);
                }
                if (authData.role) {
                    storage.setItem("userRole", authData.role);
                }

                // Cập nhật lại Context
                if (initUserData) {
                    await initUserData();
                }

                notification.success({
                    message: "Đăng Nhập Thành Công",
                    description: `Chào mừng bạn quay trở lại! (${authData.role})`,
                });

                // Điều hướng thông minh theo quyền
                if (authData.role === "ROLE_ADMIN") {
                    navigate("/admin/dashboard", { replace: true });
                } else if (authData.role === "ROLE_HOST" || authData.role === "ROLE_RECEPTIONIST") {
                    navigate("/host/dashboard", { replace: true });
                } else {
                    clearAuthData();
                    notification.warning({
                        message: "Truy Cập Bị Từ Chối",
                        description: "Tài khoản khách hàng không có quyền truy cập vào cổng quản trị.",
                    });
                }
            } else {
                notification.error({
                    message: "Đăng Nhập Thất Bại",
                    description: "Không nhận được token xác thực từ máy chủ.",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            notification.error({
                message: "Đăng Nhập Thất Bại",
                description:
                    error?.message ||
                    error?.response?.data?.message ||
                    "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full border border-slate-200">
                {/* Visual Banner */}
                <div className="w-1/2 relative hidden md:block bg-blue-900">
                    <img
                        className="w-full h-full object-cover opacity-80"
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                        alt="Luxury Hotel"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="inline-block bg-blue-600/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-2 self-start">
                            Cổng Quản Trị Hệ Thống
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                            Hotel & Resort Management
                        </h2>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Nền tảng đồng bộ quản trị chỗ nghỉ, vận hành phòng vật lý và trung tâm phân tích doanh thu thời gian thực.
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center md:text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg mb-3">
                            HB
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Đăng Nhập Cổng Quản Trị</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Dành cho Quản trị viên sàn (Admin) và Đối tác khách sạn (Host)
                        </p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={handleLogin}
                        requiredMark={false}
                    >
                        <Form.Item
                            label={<span className="text-slate-700 font-medium text-xs">Email / Tên tài khoản</span>}
                            name="username"
                            rules={[
                                { required: true, message: "Vui lòng nhập email đăng nhập!" },
                                { type: "email", message: "Email không đúng định dạng!" }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-slate-400" />}
                                placeholder="admin@gmail.com hoặc host email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-slate-700 font-medium text-xs">Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-slate-400" />}
                                placeholder="••••••••"
                                size="large"
                            />
                        </Form.Item>

                        <div className="flex items-center justify-between mb-6">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox className="text-xs text-slate-600">Ghi nhớ phiên đăng nhập</Checkbox>
                            </Form.Item>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={isSubmitting}
                            block
                            className="h-11 font-semibold tracking-wide shadow-md"
                        >
                            Đăng Nhập
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;