import { createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layout/AppLayout"
import DashboardLayout from "@/layout/DashboardLayout"
import AiAssistantPage from "@/pages/AiAssistantPage"
import LoginPage from "@/pages/auth/Loginpage"
import RegisterPage from "@/pages/auth/RegisterPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import ExpensePage from "@/pages/ExpensePage"
import HomePage from "@/pages/HomePage"
import KhataPage from "@/pages/KhataPage"
import SalesPage from "@/pages/SalesPage"

import AnalyticsPage from "@/pages/AnalyticsPage"
import ScannerPage from '@/pages/ScannerPage';
import BillingPage from "@/pages/BillingPage"
import CategoriesPage from "@/pages/CategoriesPage"
import CustomersPage from "@/pages/CustomersPage"
import InventoryPage from "@/pages/InventoryPage"
import SettingsPage from "@/pages/SettingsPage"
import TrialExpiredPage from "@/pages/TrialExpiredPage"
import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"
import PaymentVerifyPage from "@/pages/PaymentVerifyPage";
import SubscriptionPage from "@/pages/SubscriptionPage"
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
      { path: "/trial-expired", element: <TrialExpiredPage /> },
      { path: "/payment/verify", element: <PaymentVerifyPage /> },
    ],
  },
{ path: "/scan", element: <ScannerPage /> },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/dashboard/inventory", element: <InventoryPage /> },

      { path: "/dashboard/billing", element: <BillingPage /> },
      { path: "/dashboard/sales", element: <SalesPage /> },
      { path: "/dashboard/customers", element: <CustomersPage /> },
      { path: "/dashboard/analytics", element: <AnalyticsPage /> },
      { path: "/dashboard/settings", element: <SettingsPage /> },
      { path: "/dashboard/categories", element: <CategoriesPage /> },
      { path: "/dashboard/khata", element: <KhataPage /> },
      { path: "/dashboard/expenses", element: <ExpensePage /> },
      { path: "/dashboard/ai-assistant", element: <AiAssistantPage /> },
       { 
      path: "/dashboard/subscription",
      element: <SubscriptionPage />
    },
    ],
  },
])
