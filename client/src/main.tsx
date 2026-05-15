// import { StrictMode } from "react"
// import { createRoot } from "react-dom/client"

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { RouterProvider } from "react-router-dom"

// import { Toaster } from "react-hot-toast"

// import "./index.css"

// import { ThemeProvider } from "@/components/theme-provider"
// import { router } from "@/routes"

// const queryClient = new QueryClient()

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider defaultTheme="light" storageKey="karobar-theme">
//         <RouterProvider router={router} />
//         <Toaster position="top-right" />
//       </ThemeProvider>
//     </QueryClientProvider>
//   </StrictMode>
// )

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { Toaster } from "react-hot-toast"

import "./index.css"

import { ThemeProvider } from "@/components/theme-provider"
import { router } from "@/routes"

// 👇 ADD THIS
import { TooltipProvider } from "@/components/ui/tooltip"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="karobar-theme">
        {/* ✅ ADD TOOLTIP PROVIDER HERE */}
        <TooltipProvider delayDuration={0}>
          <RouterProvider router={router} />
        </TooltipProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
