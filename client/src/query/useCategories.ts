import { getCategories, type Category } from "@/api/categories"
import { useQuery } from "@tanstack/react-query"

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories()
      return res.data?.data ?? res.data ?? []
    },
  })
}
