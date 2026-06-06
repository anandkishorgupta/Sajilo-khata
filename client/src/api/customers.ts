import { api } from "@/services/api-client"

export type Customer = {
  id: number
  name: string
  phone: string
  address?: string
  createdAt: string
  sales?: any[]
  khataTransactions?: any[]
}

export type KhataTransaction = {
  id: number
  type: "credit" | "payment"
  amount: string | number
  note?: string
  createdAt: string
  sale?: { id: number; invoiceNumber: string }
}

export type CustomerBalance = {
  totalCredit: number
  totalPayment: number
  balance: number
}

export const getCustomers = () => api.get("/customers")

export const getCustomer = (id: number) => api.get(`/customers/${id}`)

export const createCustomer = (data: {
  name: string
  phone: string
  address?: string
}) => api.post("/customers", data)

export const updateCustomer = (
  id: number,
  data: { name?: string; phone?: string; address?: string }
) => api.put(`/customers/${id}`, data)

export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`)

// Khata
export const getCustomerLedger = (customerId: number) =>
  api.get(`/khata/customer/${customerId}`)

export const getCustomerBalance = (customerId: number) =>
  api.get(`/khata/customer/${customerId}/balance`)

export const createKhataPayment = (data: {
  customerId: number
  amount: number
  note?: string
}) => api.post("/khata/pay", data)
