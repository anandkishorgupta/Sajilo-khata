import { api } from "@/services/api-client";

export type Category = {
    id: number
    name: string
    description?: string
    createdAt: string
    updatedAt: string
}

export const getCategories = () => api.get("/categories")

export const getCategory = (id: number) => api.get(`/categories/${id}`)

export const createCategory = (data: { name: string; description?: string }) =>
    api.post("/categories", data)

export const updateCategory = (
    id: number,
    data: { name?: string; description?: string }
) => api.put(`/categories/${id}`, data)

export const deleteCategory = (id: number) => api.delete(`/categories/${id}`)



