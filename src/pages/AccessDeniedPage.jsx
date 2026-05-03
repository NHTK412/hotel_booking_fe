import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const AccessDeniedPage = () => {

    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center h-screen">
            <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
                extra={
                    <Button type="primary" onClick={() => navigate("/login")}>
                        Quay lại trang đăng nhập
                    </Button>
                }
            />
        </div>
    );
}

export default AccessDeniedPage;
