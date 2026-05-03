import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {

    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (accessToken) {
        return (
            <Navigate to="/"></Navigate>
        );
    }

    return (
        <>
            {children}
        </>
    );
}

export default PublicRoute;