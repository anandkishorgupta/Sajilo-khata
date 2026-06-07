import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import UserBadge from "@/components/shared/UserBadge"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* RIGHT SIDE USER BADGE */}
          <UserBadge />
        </header>

        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
