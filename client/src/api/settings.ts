import { api } from "@/services/api-client"

export interface UserProfile {
  id: number
  name: string
  email: string
  createdAt: string

  shop: {
    id: number
    name: string
    address: string
    phone: string
    plan: "trial" | "pro"
    expiresAt: string | null
    createdAt: string
  }
}

export async function getProfile(): Promise<UserProfile> {
  const res = await api.get("/users/profile")
  return res.data.data
}

export async function updateProfile(data: { name?: string; email?: string }) {
  const res = await api.patch("/users/profile", data)
  return res.data.data
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const res = await api.patch("/users/change-password", data)
  return res.data.data
}

export async function updateShop(data: {
  name?: string
  address?: string
  phone?: string
}) {
  const res = await api.patch("/shops", data)
  return res.data.data
}
