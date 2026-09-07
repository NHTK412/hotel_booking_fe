import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { globalContext } from "../context/GlobalContext";
import AccessDeniedPage from "../pages/AccessDeniedPage";

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
    const { role, isLoading } = useContext(globalContext);
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const storedRole = role || localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
                <Spin size="large" />
                <span className="text-slate-500 font-medium">Đang xác thực thông tin...</span>
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(storedRole)) {
        return <AccessDeniedPage />;
    }

    return children ? children : <Outlet />;
};

export default RoleBasedRoute;
