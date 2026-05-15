import { Outlet } from "react-router-dom"


import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/AppSidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />

          <div>
            <h1 className="text-lg font-semibold">
              Dashboard
            </h1>
          </div>
        </header>

        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}