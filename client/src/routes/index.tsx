import { createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layout/AppLayout"
import DashboardLayout from "@/layout/DashboardLayout"

import LoginPage from "@/pages/auth/Loginpage"
import RegisterPage from "@/pages/auth/RegisterPage"
import HomePage from "@/pages/HomePage"
import DashboardPage from "@/pages/dashboard/DashboardPage"

import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // 🌐 Public pages
      { path: "/", element: <HomePage /> },

      {
        path: "/login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },

      {
        path: "/register",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
    ],
  },

  // 🔐 DASHBOARD AREA (WITH SIDEBAR)
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },

      // future routes:
      // { path: "/dashboard/products", element: <ProductsPage /> },
      // { path: "/dashboard/sales", element: <SalesPage /> },
    ],
  },
])