import { notification } from "antd";
import { createContext, useEffect, useState } from "react";
import { getUserInfo } from "../services/userService";

export const globalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserInfo();
    }, []);


    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);
            const response = await getUserInfo();
            setIsLoading(false);
            console.log("User Info Response:", response);
            if (response && response.data) {
                setUserInfo(response.data);
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            notification.error({
                title: 'Lỗi Lấy Thông Tin Người Dùng',
                description: error.response?.message || 'Đã xảy ra lỗi khi lấy thông tin người dùng.',
            });
        }
    }

    return (
        <globalContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </globalContext.Provider>
    )

}

