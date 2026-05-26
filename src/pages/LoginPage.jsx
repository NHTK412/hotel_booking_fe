import { Button, Checkbox, Form, Image, Input, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";

const LoginPage = () => {

    const [form] = Form.useForm();

    const navigate = useNavigate();

    const handleLogin = async (values) => {
        const { username, password, remember } = values;
        try {
            const response = await login(username, password);

            if (response && response.data.accessToken) {
                localStorage.removeItem('accessToken');
                sessionStorage.removeItem('accessToken');
                if (remember) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                }
                else {
                    sessionStorage.setItem('accessToken', response.data.accessToken);
                }
            }

            notification.success({
                title: 'Đăng Nhập Thành Công',
                description: 'Bạn đã đăng nhập thành công.',
            })

            if (response && response.data.role === "ROLE_HOST") {
                navigate("/");
            }
            else {
                navigate("/user-dashboard");
            }
        }
        catch (error) {
            console.error("Login error:", error);
            notification.error({
                title: 'Đăng Nhập Thất Bại',
                // description: error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.',
                description: 'Tên người dùng hoặc mật khẩu không đúng. Vui lòng thử lại.',
            })
        }
    }

    return (
        <>
            <div className="flex flex-row justify-center items-center h-screen bg-gray-100">

                <div className="flex shadow-md rounded-lg overflow-hidden">
                    <img
                        className="w-[50vh] h-[50vh] hidden md:block rounded-l-lg shadow-md"
                        src="https://acihome.vn/uploads/15/thiet-ke-khach-san-ven-bien-dang-cap-nghi-duong-5-sao-tien-nghi-hien-dai-2.JPG"
                        alt="Ảnh Lỗi"
                    />
                    <div className="w-[400px] p-10 flex flex-col justify-center bg-white">
                        <h1 className="text-2xl font-bold mb-5 text-center">
                            Đăng Nhập Tài Khoản
                        </h1>

                        <Form
                            form={form}
                            name="login"
                            layout="vertical"
                            initialValues={{ remember: true }}
                            onFinish={handleLogin}
                        >

                            <Form.Item
                                label="Tên người dùng"
                                name="username"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                            </Form.Item>

                            <Button
                                type="primary"
                                onClick={
                                    () => {
                                        form.submit();
                                    }
                                }
                                block
                            >
                                Đăng Nhập
                            </Button>

                        </Form>
                    </div>

                </div>
            </div>
        </>
    );
}


export default LoginPage;