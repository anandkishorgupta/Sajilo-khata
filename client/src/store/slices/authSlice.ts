import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { decodeJwtPayload } from "@/utils/auth"

type User = {
    id: number
    name: string
    email: string
    role: 'owner' | 'staff'
}

type AuthState = {
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
}

function getRoleFromToken(token: string): 'owner' | 'staff' {
    const payload = decodeJwtPayload(token)
    return payload?.role === 'staff' ? 'staff' : 'owner'
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) {
            const tokenRole = getRoleFromToken(action.payload.token)
            state.user = { ...action.payload.user, role: tokenRole }
            state.token = action.payload.token
            state.isAuthenticated = true
        },

        logout(state) {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("shop")
        },
        hydrateAuth(
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) {
            const tokenRole = getRoleFromToken(action.payload.token)
            state.user = { ...action.payload.user, role: tokenRole }
            state.token = action.payload.token
            state.isAuthenticated = true
        },
    },
})

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions
export default authSlice.reducer