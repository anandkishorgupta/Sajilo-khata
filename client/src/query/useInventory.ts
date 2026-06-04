import { getInventoryStats, getProducts } from "@/api/inventory";
import { useQuery } from "@tanstack/react-query";

// inventory stats for dashboard
export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const response = await getInventoryStats();
      return response.data.data;
    },
  });
}

// products filtered by search, category, stock status


export function useProducts(filters: {
  search?: string;
  category?: string;
  stockFilter?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await getProducts(filters);

      return {
        products: res.data.data.map((p: any) => ({
          ...p,
          purchasePrice: Number(p.purchasePrice),  // ADD
          sellingPrice: Number(p.sellingPrice),     // ADD
        })),
        meta: res.data.meta,
      };
    },
  });
}