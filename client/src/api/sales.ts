import { api } from "@/services/api-client";
import type {
    PaginatedSales,
    Sale,
    SalesFilters,
    SalesSummary,
} from "@/types/sale";

function buildParams(filters: Partial<SalesFilters>) {
    const params: Record<string, string | number> = {};

    if (filters.range) params.range = filters.range;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return params;
}

export async function getSales(
    filters: Partial<SalesFilters>,
): Promise<PaginatedSales> {
    const { data } = await api.get<PaginatedSales>("/sales", {
        params: buildParams(filters),
    });
    return data;
}

export async function getSalesSummary(
    filters: Partial<SalesFilters>,
): Promise<SalesSummary> {
    const { data } = await api.get<SalesSummary>("/sales/summary", {
        params: buildParams(filters),
    });
    console.log("Sales Summary Data:", data);
    return data.data;
}

export async function getSaleById(id: number): Promise<Sale> {
    const { data } = await api.get<Sale>(`/sales/${id}`);
    return data;
}

export async function deleteSale(id: number): Promise<void> {
    await api.delete(`/sales/${id}`);
}