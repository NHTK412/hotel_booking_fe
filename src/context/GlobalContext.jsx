import { notification } from "antd";
import { createContext, useEffect, useState } from "react";
import { getListHotel, getUserInfo } from "../services/UserService";
import { logout } from "../services/AuthService";

export const globalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState(() => {
        return localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || null;
    });
    const [listHotel, setListHotel] = useState([]);
    const [hotelCurrent, setHotelCurrent] = useState(() => {
        const saved = localStorage.getItem("hotelCurrent");
        return saved ? Number(saved) : 0;
    });

    useEffect(() => {
        localStorage.setItem("hotelCurrent", hotelCurrent);
    }, [hotelCurrent]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (token) {
            initUserData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const initUserData = async () => {
        try {
            setIsLoading(true);
            const userRes = await getUserInfo();
            if (userRes && userRes.data) {
                setUserInfo(userRes.data);
            }

            const currentRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
            setRole(currentRole);

            // Chỉ gọi danh sách khách sạn nếu tài khoản là Host hoặc Receptionist
            if (currentRole === "ROLE_HOST" || currentRole === "ROLE_RECEPTIONIST") {
                try {
                    const hotelRes = await getListHotel();
                    if (hotelRes && hotelRes.data) {
                        setListHotel(hotelRes.data);
                    }
                } catch (hotelErr) {
                    console.warn("Chưa tải được danh sách khách sạn của Host:", hotelErr);
                }
            }
        } catch (error) {
            console.error("Lỗi khởi tạo thông tin người dùng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            setUserInfo(null);
            setRole(null);
            setListHotel([]);
            setHotelCurrent(0);
            window.location.href = "/login";
        }
    };

    const refreshHotels = async () => {
        try {
            const hotelRes = await getListHotel();
            if (hotelRes && hotelRes.data) {
                setListHotel(hotelRes.data);
            }
        } catch (err) {
            console.error("Lỗi làm mới danh sách khách sạn:", err);
        }
    };

    return (
        <globalContext.Provider
            value={{
                userInfo,
                setUserInfo,
                role,
                setRole,
                isLoading,
                setIsLoading,
                listHotel,
                setListHotel,
                hotelCurrent,
                setHotelCurrent,
                handleLogout,
                refreshHotels,
                initUserData
            }}
        >
            {children}
        </globalContext.Provider>
    );
};

export default GlobalProvider;
