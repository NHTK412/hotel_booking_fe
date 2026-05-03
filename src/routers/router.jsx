import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage></LoginPage>
    },
    {
        path: "/",
        element: <DashboardLayout></DashboardLayout>,
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
                element: <h2 className="text-2xl font-medium">My Profile</h2>
            },
            {
                path: "hotels",
                element: <h2 className="text-2xl font-medium">Hotels List</h2>
            }
        ]
    }
])

export default router;