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
}) {
  return useQuery({
    queryKey: ["products", filters],  // ✅ filters in key = refetch on change
    queryFn: async () => {
      const res = await getProducts(filters);
      const result = res.data;
      if (Array.isArray(result)) return result;
      if (Array.isArray(result?.data)) return result.data;
      if (Array.isArray(result?.products)) return result.products;
      return [];
    },
  });
}