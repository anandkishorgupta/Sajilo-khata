import { createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layout/AppLayout"

import LoginPage from "@/pages/auth/Loginpage"
import RegisterPage from "@/pages/auth/RegisterPage"
import HomePage from "@/pages/HomePage"

export const router = createBrowserRouter([
  {
    element: <AppLayout />, // Header visible everywhere here
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
])
