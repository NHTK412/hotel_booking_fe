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
                element: <h2 className="text-2xl font-medium">Welcome to the Dashboard</h2>
            },
            {
                path: "rooms",
                // element: <RoomTypeTable></RoomTypeTable>
                element: <ListRoomTypePage></ListRoomTypePage>
            },
            {
                path: "bookings",
                // element: <h2 className="text-2xl font-medium">Bookings List</h2>
                element: <BookingPage></BookingPage>
            },
            {
                path: "me",
                element: <UserPage></UserPage>
            },
            // {
            //     path: "hotels",
            //     element: <h2 className="text-2xl font-medium">Hotels List</h2>
            // }
        ]
    }
])

export default router;