import { logout } from "@/store/slices/authSlice";
import { store } from "@/store/store";
import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000",
})

// attach token automatically
api.interceptors.request.use((config) => {
    const token = store.getState().auth.token

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// global error handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            store.dispatch(logout())
            window.location.href = "/login"
        }
        console.log("API error response:", err.response) // log the full error response for debugging
        // ✅ add this
        if (
            err.response?.status === 403 &&
            err.response?.data?.message === "SUBSCRIPTION_EXPIRED"
        ) {
            // store.dispatch(logout())
            window.location.href = "/trial-expired"
        }

        return Promise.reject(err)
    }
)