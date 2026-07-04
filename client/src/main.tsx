import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { Provider } from "react-redux"
import { store } from "./store/store"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { Toaster } from "react-hot-toast"

import "./index.css"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { router } from "@/routes"

import { hydrateAuth } from "./store/slices/authSlice"
import { getStoredToken, getStoredUser } from "./utils/auth"

// Hydrate auth state from localStorage
const storedToken = getStoredToken()
const storedUser = getStoredUser()

if (storedToken && storedUser) {
  store.dispatch(hydrateAuth({ token: storedToken, user: storedUser }))
}

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="karobar-theme">
          <TooltipProvider delayDuration={0}>
            <RouterProvider router={router} />
          </TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
