import { notification } from "antd";
import { createContext, useEffect, useState, useMemo } from "react";
import { getUserInfo } from "../services/UserService";
import { getMyAccommodations } from "../services/AccommodationService";
import { logout } from "../services/AuthService";

export const globalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState(() => {
        return localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || null;
    });

    const [listHotel, setListHotel] = useState([]);

    // selectedAccommodationId: "" hoặc null nghĩa là "Tất cả cơ sở"
    const [selectedAccommodationId, setSelectedAccommodationIdState] = useState(() => {
        return localStorage.getItem("selectedAccommodationId") || "";
    });

    const setSelectedAccommodationId = (id) => {
        const val = id !== undefined && id !== null ? String(id) : "";
        setSelectedAccommodationIdState(val);
        if (val) {
            localStorage.setItem("selectedAccommodationId", val);
        } else {
            localStorage.removeItem("selectedAccommodationId");
        }
    };

    // Tìm khách sạn tương ứng nếu đang chọn 1 cơ sở cụ thể
    const currentHotel = useMemo(() => {
        if (!selectedAccommodationId || !listHotel || listHotel.length === 0) {
            return null;
        }
        return listHotel.find(
            (h) => String(h.accommodationId) === String(selectedAccommodationId)
        ) || null;
    }, [selectedAccommodationId, listHotel]);

    // Backward-compatibility: index hotelCurrent
    const hotelCurrent = useMemo(() => {
        if (!listHotel || listHotel.length === 0) return 0;
        if (!selectedAccommodationId) return 0;
        const idx = listHotel.findIndex(
            (h) => String(h.accommodationId) === String(selectedAccommodationId)
        );
        return idx >= 0 ? idx : 0;
    }, [selectedAccommodationId, listHotel]);

    const setHotelCurrent = (index) => {
        if (listHotel && listHotel[index]) {
            setSelectedAccommodationId(listHotel[index].accommodationId);
        } else {
            setSelectedAccommodationId("");
        }
    };

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
                    const hotelRes = await getMyAccommodations();
                    const hotels = hotelRes?.data || hotelRes || [];
                    if (Array.isArray(hotels)) {
                        setListHotel(hotels);
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
            setSelectedAccommodationIdState("");
            localStorage.removeItem("selectedAccommodationId");
            localStorage.removeItem("hotelCurrent");
            window.location.href = "/login";
        }
    };

    const refreshHotels = async () => {
        try {
            const hotelRes = await getMyAccommodations();
            const hotels = hotelRes?.data || hotelRes || [];
            if (Array.isArray(hotels)) {
                setListHotel(hotels);
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
                selectedAccommodationId,
                setSelectedAccommodationId,
                currentHotel,
                hotelCurrent,
                setHotelCurrent,
                handleLogout,
                refreshHotels,
                initUserData,
            }}
        >
            {children}
        </globalContext.Provider>
    );
};

export default GlobalProvider;

