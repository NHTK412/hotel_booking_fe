import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import UserInfo from "../components/UserInfo";
import UserPage from "../pages/UserPage";
import { GlobalProvider } from "../context/GlobalContext";
import NotFoundPage from "../pages/NotFoundPage";
// import RoomTypeTable from "../components/RoomTypeTable";
import ListRoomTypePage from "../pages/ListRoomTypePage";
import BookingPage from "../pages/BookingPage";
import DashboardPage from "../pages/DashboardPage";
import StaffPage from "../pages/StaffPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <PublicRoute>
                <LoginPage></LoginPage>
            </PublicRoute>
        )
    },
    {
        path: "/",
        errorElement: <NotFoundPage></NotFoundPage>,
        element: (
            <GlobalProvider>
                <PrivateRoute>
                    <DashboardLayout></DashboardLayout>
                </PrivateRoute>
            </GlobalProvider>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage></DashboardPage>
            },
            {
                path: "rooms",
                element: <ListRoomTypePage></ListRoomTypePage>
            },
            {
                path: "bookings",
                element: <BookingPage></BookingPage>
            },
            {
                path: "me",
                element: <UserPage></UserPage>
            },
            {
                path: "staff",
                element: <StaffPage></StaffPage>
            }
        ]
    }
])

export default router;