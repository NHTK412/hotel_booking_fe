import { useContext } from "react";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import { globalContext } from "../context/GlobalContext";
import { Spin } from "antd";

const PrivateRoute = ({ children }) => {
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const { userInfo, isLoading } = useContext(globalContext);

    // if (isLoading) {
    //     return (
    //         <>
    //         {children}
    //         </>
    //     )
    // }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!accessToken || userInfo?.role !== "ROLE_HOST") {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        return (
            <AccessDeniedPage></AccessDeniedPage>
        );
    }




    return (
        <>
            {children}
        </>
    );
}

export default PrivateRoute;