// api/expenses.ts
import { api } from "@/services/api-client";

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category?: string;
  note?: string;
  date: string;
};

type ApiResponse<T> = {
  data: T;
};

export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const res = await api.get<ApiResponse<Expense[]>>("/expenses");
    return res.data.data || [];
  },

  create: async (payload: any) => {
    const res = await api.post("/expenses", payload);
    return res.data.data;
  },

  remove: async (id: number) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data.data;
  },
};