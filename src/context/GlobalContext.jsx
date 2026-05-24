import { notification } from "antd";
import { createContext, use, useEffect, useState } from "react";
import { getListHotel, getUserInfo } from "../services/userService";

export const globalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [listHotel, setListHotel] = useState([]);
    const [hotelCurrent, setHotelCurrent] = useState(() => {
        const saved = localStorage.getItem("hotelCurrent");
        return saved ? Number(saved) : 0;
    });

    useEffect(() => {
        localStorage.setItem("hotelCurrent", hotelCurrent);
    }, [hotelCurrent]);

    useEffect(() => {

        fetchUserInfo();
        fetchListHotel();
    }, []);


    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);
            const response = await getUserInfo();
            setIsLoading(false);
            if (response && response.data) {
                setUserInfo(response.data);
            }
        } catch (error) {
            notification.error({
                title: 'Lỗi Lấy Thông Tin Người Dùng',
                description: error.response?.message || 'Đã xảy ra lỗi khi lấy thông tin người dùng.',
            });
        }
    }

    const fetchListHotel = async () => {
        try {
            setIsLoading(true);
            const response = await getListHotel();
            if (response && response.data) {
                setListHotel(response.data);
            }
            setIsLoading(false);
        } catch (err) {
            notification.error({
                title: 'Lỗi Lấy Danh Sách Khách Sạn',
                description: err.response?.message || 'Đã xảy ra lỗi khi lấy danh sách khách sạn.',
            });
        }
    }

    return (
        <globalContext.Provider value={{ userInfo, setUserInfo, isLoading, setIsLoading, listHotel, setListHotel, hotelCurrent, setHotelCurrent }}>
            {children}
        </globalContext.Provider>
    )

}

