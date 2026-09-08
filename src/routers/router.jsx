import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import HostLayout from "../layouts/HostLayout";
import LoginPage from "../pages/LoginPage";
import PublicRoute from "./PublicRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import RootRedirect from "./RootRedirect";
import UserPage from "../pages/UserPage";
import NotFoundPage from "../pages/NotFoundPage";
import ListRoomTypePage from "../pages/ListRoomTypePage";
import BookingPage from "../pages/BookingPage";
import DashboardPage from "../pages/DashboardPage";
import StaffPage from "../pages/StaffPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAccommodationsPage from "../pages/admin/AdminAccommodationsPage";
import AdminAccommodationDetailPage from "../pages/admin/AdminAccommodationDetailPage";
import AdminHostsPage from "../pages/admin/AdminHostsPage";
import AdminLocationsPage from "../pages/admin/AdminLocationsPage";

const router = createBrowserRouter([
    // Trang Đăng Nhập
    {
        path: "/login",
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },

    // Tuyến Đường Gốc Tự Điều Hướng (Root Redirect)
    {
        path: "/",
        errorElement: <NotFoundPage />,
        element: <RootRedirect />,
    },

    // Phân Hệ Admin (ROLE_ADMIN)
    {
        path: "/admin",
        errorElement: <NotFoundPage />,
        element: (
            <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <AdminLayout />
            </RoleBasedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <AdminDashboardPage />,
            },
            {
                path: "accommodations",
                element: <AdminAccommodationsPage />,
            },
            {
                path: "accommodations/:id",
                element: <AdminAccommodationDetailPage />,
            },
            {
                path: "hosts",
                element: <AdminHostsPage />,
            },
            {
                path: "locations",
                element: <AdminLocationsPage />,
            },
            {
                path: "profile",
                element: <UserPage />,
            },
        ],
    },

    // Phân Hệ Quản Lý Chỗ Nghỉ / Khách Sạn (ROLE_HOST & ROLE_RECEPTIONIST)
    {
        path: "/host",
        errorElement: <NotFoundPage />,
        element: (
            <RoleBasedRoute allowedRoles={["ROLE_HOST", "ROLE_RECEPTIONIST"]}>
                <HostLayout />
            </RoleBasedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/host/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
            {
                path: "rooms",
                element: <ListRoomTypePage />,
            },
            {
                path: "bookings",
                element: <BookingPage />,
            },
            {
                path: "staff",
                element: <StaffPage />,
            },
            {
                path: "profile",
                element: <UserPage />,
            },
        ],
    },

    // Tương thích ngược với các URL cũ
    {
        path: "/rooms",
        element: <Navigate to="/host/rooms" replace />,
    },
    {
        path: "/bookings",
        element: <Navigate to="/host/bookings" replace />,
    },
    {
        path: "/staff",
        element: <Navigate to="/host/staff" replace />,
    },
    {
        path: "/me",
        element: <Navigate to="/host/profile" replace />,
    },

    // 404 Not Found
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);

export default router;