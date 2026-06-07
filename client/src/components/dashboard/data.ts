import { api } from "@/services/api-client"

// ── Types ──

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

export type WeeklySalesPoint = {
  day: string
  amount: number
}

export type PaymentMethodData = {
  method: string
  amount: number
  percentage: number
}

export type RecentTransaction = {
  id: number
  invoiceNumber: string
  customer: string
  amount: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
}

export type TopProductData = {
  product: { id: number; name: string; sellingPrice: string }
  quantity: number
}

export type LowStockProduct = {
  id: number
  name: string
  stock: number
  lowStockLimit: number
}

export type ExpenseBreakdownData = {
  category: string
  amount: number
}

export type InventoryStatusData = {
  totalProducts: number
  lowStockCount: number
  stockValue: number
}

// ── API calls ──

export const fetchStats = () =>
  api.get<{ data: DashboardStats }>("/dashboard/stats").then((r) => r.data.data)

export const fetchSalesChart = () =>
  api.get<{ data: SalesChartPoint[] }>("/dashboard/sales-chart").then((r) => r.data.data)

export const fetchWeeklySales = () =>
  api.get<{ data: WeeklySalesPoint[] }>("/dashboard/weekly-sales").then((r) => r.data.data)

export const fetchPaymentMethods = () =>
  api.get<{ data: PaymentMethodData[] }>("/dashboard/payment-methods").then((r) => r.data.data)

export const fetchRecentTransactions = () =>
  api.get<{ data: RecentTransaction[] }>("/dashboard/recent-transactions").then((r) => r.data.data)

export const fetchTopProducts = () =>
  api.get<{ data: TopProductData[] }>("/dashboard/top-products").then((r) => r.data.data)

export const fetchLowStock = () =>
  api.get<{ data: LowStockProduct[] }>("/dashboard/low-stock").then((r) => r.data.data)

export const fetchExpenseBreakdown = () =>
  api.get<{ data: ExpenseBreakdownData[] }>("/dashboard/expense-breakdown").then((r) => r.data.data)

export const fetchInventoryStatus = () =>
  api.get<{ data: InventoryStatusData }>("/dashboard/inventory-status").then((r) => r.data.data)

export const fetchProfile = () =>
  api.get<{ data: { name: string } }>("/users/profile").then((r) => r.data.data)