import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    deleteSale,
    getSales,
    getSalesSummary,
} from "@/api/sales";
import type { SalesFilters } from "@/types/sale";
import { toast } from "react-hot-toast";

export function useSales(filters: SalesFilters) {
    return useQuery({
        queryKey: ["sales", filters],
        queryFn: () => getSales(filters),
        placeholderData: (prev) => prev, // keeps old page visible while new page loads
    });
}

export function useSalesSummary(filters: Partial<SalesFilters>) {
    return useQuery({
        queryKey: ["sales-summary", filters],
        queryFn: () => getSalesSummary(filters),
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteSale(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["sales-summary"] });
            toast.success("Bikri hatayo (Sale deleted)");
        },
        onError: () => {
            toast.error("Bikri hatauna sakiyena. Pheri try garnu hos.");
        },
    });
}