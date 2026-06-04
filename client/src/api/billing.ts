import { api } from "@/services/api-client";

export const searchProducts = (search: string) =>
  api.get("/products", {
    params: { search },
  });