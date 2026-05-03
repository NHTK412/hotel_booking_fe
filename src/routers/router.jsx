import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import UserInfo from "../components/UserInfo";
import UserPage from "../pages/UserPage";

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
        element: (
            <PrivateRoute>
                <DashboardLayout></DashboardLayout>
            </PrivateRoute>
        ),
        children: [
            {
                index: true,
                element: <h2 className="text-2xl font-medium">Welcome to the Dashboard</h2>
            },
            {
                path: "rooms",
                element: <h2 className="text-2xl font-medium">Rooms List</h2>
            },
            {
                path: "bookings",
                element: <h2 className="text-2xl font-medium">Bookings List</h2>
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