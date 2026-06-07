// import axios from "axios"

// export const api = axios.create({
//     baseURL: "http://localhost:3000",
// })

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token")

//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }

//     return config
// })


import { logout } from "@/store/slices/authSlice";
import { store } from "@/store/store";
import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000", // change to your backend
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
            // localStorage.removeItem("token")
            // localStorage.removeItem("user")
            // localStorage.removeItem("shop")
            window.location.href = "/login"
        }
        return Promise.reject(err)
    }
)