import { Divider } from "antd";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import HotelInfo from "../components/HotelInfo";
import UserInfo from "../components/UserInfo";
import { globalContext } from "../context/GlobalContext";

const UserPage = () => {
    const { role } = useContext(globalContext);
    const location = useLocation();

    // Tài khoản Admin quản trị toàn sàn nên không hiển thị khối thông tin khách sạn
    const isAdmin = role === "ROLE_ADMIN" || location.pathname.startsWith("/admin");

    return (
        <div className="flex flex-col space-y-10">
            <UserInfo />
            {!isAdmin && (
                <>
                    <Divider />
                    <HotelInfo />
                </>
            )}
        </div>
    );
};

export default UserPage;