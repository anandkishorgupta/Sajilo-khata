import { api } from "@/services/api-client"

export type KhataCustomer = {
  customer: {
    id: number
    name: string
    phone: string
    address?: string
    createdAt: string
  }
  balance: number
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

export const getKhataCustomers = () =>
  api.get<KhataCustomer[]>("/khata")

export const getCustomerLedger = (customerId: number) =>
  api.get<KhataTransaction[]>(`/khata/customer/${customerId}`)

export const getCustomerBalance = (customerId: number) =>
  api.get<CustomerBalance>(`/khata/customer/${customerId}/balance`)

export const createKhataPayment = (data: {
  customerId: number
  amount: number
  note?: string
}) => api.post("/khata/pay", data)
