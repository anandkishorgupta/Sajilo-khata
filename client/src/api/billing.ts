import { api } from "@/services/api-client";

export const searchProducts = (search: string) =>
  api.get("/products", {
    params: { search },
  });

export type CreateSalePayload = {
  items: { productId: number; quantity: number; unitPrice: number }[];
  paymentMethod: "cash" | "qr" | "credit";
  discount?: number;
  tax?: number;
  paidAmount?: number;
  customerId?: number;
  note?: string;
};

export const createSale = (data: CreateSalePayload) =>
  api.post("/sales", data);

export const getCustomers = (search?: string) =>
  api.get("/customers", { params: search ? { search } : {} });

export const createCustomer = (data: {
  name: string;
  phone: string;
  address?: string;
}) => api.post("/customers", data);

export const downloadInvoice = (saleId: number) =>
  api.get(`/invoices/${saleId}/pdf`, { responseType: "blob" });

export const downloadThermalReceipt = (saleId: number) =>
  api.get(`/invoices/${saleId}/thermal`, { responseType: "blob" });