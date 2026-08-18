import axios from "axios"
import { store } from "@/store/store"

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

adminApi.interceptors.request.use((config) => {
    const token = store.getState().adminAuth.token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

adminApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            store.dispatch({ type: "adminAuth/adminLogout" })
            window.location.href = "/admin/login"
        }
        return Promise.reject(err)
    },
)

export async function adminLogin(email: string, password: string) {
    const res = await adminApi.post("/admin/auth/login", { email, password })
    return res.data.data
}

export async function getAdminStats() {
    const res = await adminApi.get("/admin/stats")
    return res.data.data
}

export async function getAdminShops(params?: { search?: string; plan?: string; page?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set("search", params.search)
    if (params?.plan) query.set("plan", params.plan)
    if (params?.page) query.set("page", String(params.page))
    const res = await adminApi.get(`/admin/shops?${query.toString()}`)
    return res.data.data
}

export async function getAdminShopDetail(id: number) {
    const res = await adminApi.get(`/admin/shops/${id}`)
    return res.data.data
}

export async function extendShop(shopId: number, durationDays: number, plan?: string) {
    const res = await adminApi.patch(`/admin/shops/${shopId}/extend`, { durationDays, plan })
    return res.data.data
}

export async function getAdminUsers(params?: { search?: string; role?: string; page?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set("search", params.search)
    if (params?.role) query.set("role", params.role)
    if (params?.page) query.set("page", String(params.page))
    const res = await adminApi.get(`/admin/users?${query.toString()}`)
    return res.data.data
}

export async function getAdminPayments(params?: { page?: number; status?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set("page", String(params.page))
    if (params?.status) query.set("status", params.status)
    const res = await adminApi.get(`/admin/payments?${query.toString()}`)
    return res.data.data
}
