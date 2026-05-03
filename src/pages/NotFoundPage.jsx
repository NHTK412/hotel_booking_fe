import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {

    const navigate = useNavigate();

    return (
        <div className="flex flex-row justify-center items-center h-screen">
            <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
                extra={<Button type="primary" onClick={() => navigate("/")}>Về Trang Chủ</Button>}
            />
        </div>
    );
}


export default NotFoundPage;