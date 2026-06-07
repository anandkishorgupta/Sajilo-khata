import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

type User = {
    id: number
    name: string
    email: string
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

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        },

        logout(state) {
            state.user = null
            state.token = null
            state.isAuthenticated = false
        },
        // Runs when app reloads (refresh page)
        hydrateAuth(
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        },
    },
})

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions
export default authSlice.reducer