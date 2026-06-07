import { api } from "@/services/api-client"

export type DashboardStats = {
  totalSales: number
  totalPurchase: number
  totalExpense: number
  grossProfit: number
  netProfit: number
  totalDue: number
  totalProducts: number
  lowStockCount: number
}

export type SalesChartPoint = {
  date: string
  amount: number
}

export type TopProduct = {
  product: { id: number; name: string; sellingPrice: string }
  quantity: number
}

export type LowStockProduct = {
  id: number
  name: string
  stock: number
  lowStockLimit: number
}

export type DueAnalytics = {
  totalCredit: number
  totalPayment: number
  remainingDue: number
}

export const getDashboardStats = () => api.get("/dashboard/stats")

export const getSalesChart = () => api.get("/dashboard/sales-chart")

export const getTopProducts = () => api.get("/dashboard/top-products")

export const getLowStock = () => api.get("/dashboard/low-stock")

export const getDueAnalytics = () => api.get("/dashboard/due-analytics")
