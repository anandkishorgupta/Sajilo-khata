export type PaymentMethod = "cash" | "qr" | "bank" | "credit" | "mixed";
export type PaymentStatus = "paid" | "partial" | "due";

export interface Product {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  purchasePrice: string | number;
  subtotal: string | number;
  profit: string | number;
  product: Product;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  totalAmount: string | number;
  paidAmount: string | number;
  dueAmount: string | number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  note?: string;
  customer?: Customer | null;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSales {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesSummary {
  totalBills: number;
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  cashReceived: number;
  dueBillsCount: number;
}

export type DateRangeFilter = "today" | "yesterday" | "week" | "month";

export interface SalesFilters {
  range?: DateRangeFilter;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  search?: string;
  page: number;
  limit: number;
}