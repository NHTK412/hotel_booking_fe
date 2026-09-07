import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { globalContext } from "../context/GlobalContext";
import { Spin } from "antd";

const RootRedirect = () => {
    const { role, isLoading } = useContext(globalContext);
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const currentRole = role || localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Spin size="large" />
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (currentRole === "ROLE_ADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (currentRole === "ROLE_HOST" || currentRole === "ROLE_RECEPTIONIST") {
        return <Navigate to="/host/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default RootRedirect;
