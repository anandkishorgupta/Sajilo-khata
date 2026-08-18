import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { decodeJwtPayload } from "@/utils/auth"

type AdminUser = {
    id: number
    name: string
    email: string
}

type AdminAuthState = {
    admin: AdminUser | null
    token: string | null
    isAuthenticated: boolean
}

const initialState: AdminAuthState = {
    admin: null,
    token: null,
    isAuthenticated: false,
}

const adminSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        adminLoginSuccess(
            state,
            action: PayloadAction<{ admin: AdminUser; token: string }>
        ) {
            state.admin = action.payload.admin
            state.token = action.payload.token
            state.isAuthenticated = true
        },
        adminLogout(state) {
            state.admin = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem("admin_token")
            localStorage.removeItem("admin_user")
        },
        hydrateAdminAuth(
            state,
            action: PayloadAction<{ admin: AdminUser; token: string }>
        ) {
            state.admin = action.payload.admin
            state.token = action.payload.token
            state.isAuthenticated = true
        },
    },
})

export const { adminLoginSuccess, adminLogout, hydrateAdminAuth } = adminSlice.actions
export default adminSlice.reducer
