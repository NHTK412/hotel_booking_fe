import AccessDeniedPage from "../pages/AccessDeniedPage";

const PrivateRoute = ({ children }) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
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