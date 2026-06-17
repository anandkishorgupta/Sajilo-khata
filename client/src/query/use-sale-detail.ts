import { useQuery } from "@tanstack/react-query";
import { getSaleById } from "@/api/sales";
export function useSaleDetail(id: number | null) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => getSaleById(id as number),
    enabled: id !== null, // only fetch when a sale is actually selected
  });
}