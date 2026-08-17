import { api } from "@/services/api-client"

export interface StaffMember {
  id: number
  name: string
  email: string
  role: 'owner' | 'staff'
  createdAt: string
}

export interface CreateStaffData {
  name: string
  email: string
  phone: string
  password: string
}

export async function getStaff(): Promise<StaffMember[]> {
  const res = await api.get("/staff")
  return res.data.data
}

export async function createStaff(data: CreateStaffData): Promise<StaffMember> {
  const res = await api.post("/staff", data)
  return res.data.data
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/staff/${id}`)
}
