import { createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layout/AppLayout"
import DashboardLayout from "@/layout/DashboardLayout"

import LoginPage from "@/pages/auth/Loginpage"
import RegisterPage from "@/pages/auth/RegisterPage"
import HomePage from "@/pages/HomePage"
import DashboardPage from "@/pages/dashboard/DashboardPage"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },

  // 👇 DASHBOARD SECTION (WITH SIDEBAR)
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
    ],
  },
])