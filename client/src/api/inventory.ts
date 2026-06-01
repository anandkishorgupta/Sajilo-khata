import { api } from "@/services/api-client";

export type Product = {
  id: number;           // ✅ numeric id, was _id: string
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockLimit: number;
  imageUrl?: string;
  // expiryDate?: string;
};

export type InventoryStats = {
  total: number;
  lowStock: number;
  expiringSoon: number;
  categories: number;
  stockValue: number;
};

export const getProducts = (params?: {
  search?: string;
  category?: string;
  stockFilter?: string;
}) => api.get<Product[]>("/products", { params });

export const getInventoryStats = () =>
  api.get<InventoryStats>("/products/stats");

export const createProduct = async (data: any, imageFile?: File) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("sku", data.sku);
  formData.append("category", data.category);
  formData.append("purchasePrice", String(data.purchasePrice));
  formData.append("sellingPrice", String(data.sellingPrice));
  formData.append("stock", String(data.stock));
  formData.append("lowStockLimit", String(data.lowStockLimit));
  // if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
  if (imageFile) formData.append("image", imageFile);

  const response = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (id: number, data: any, image?: File) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("sku", data.sku);
  formData.append("category", data.category);
  formData.append("purchasePrice", String(data.purchasePrice));
  formData.append("sellingPrice", String(data.sellingPrice));
  formData.append("stock", String(data.stock));
  formData.append("lowStockLimit", String(data.lowStockLimit));
  // if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
  if (image) formData.append("image", image);

  const response = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};