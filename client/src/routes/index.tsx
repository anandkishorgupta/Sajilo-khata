import { createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layout/AppLayout"
import DashboardLayout from "@/layout/DashboardLayout"
import KhataPage from "@/pages/KhataPage"
import ExpensePage from "@/pages/ExpensePage"
import LoginPage from "@/pages/auth/Loginpage"
import RegisterPage from "@/pages/auth/RegisterPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import HomePage from "@/pages/HomePage"

import BillingPage from "@/pages/BillingPage"
import InventoryPage from "@/pages/InventoryPage"

import AnalyticsPage from "@/pages/AnalyticsPage"
import CategoriesPage from "@/pages/CategoriesPage"
import CustomersPage from "@/pages/CustomersPage"
import SettingsPage from "@/pages/SettingsPage"
import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
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

  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/dashboard/inventory", element: <InventoryPage /> },

      // ✅ ADD THIS
      { path: "/dashboard/billing", element: <BillingPage /> },
      { path: "/dashboard/customers", element: <CustomersPage /> },
      { path: "/dashboard/analytics", element: <AnalyticsPage /> },
      { path: "/dashboard/settings", element: <SettingsPage /> },
      { path: "/dashboard/categories", element: <CategoriesPage /> },
      { path: "/dashboard/khata", element: <KhataPage /> },
      { path: "/dashboard/expenses", element: <ExpensePage /> },

    ],
  },
])
