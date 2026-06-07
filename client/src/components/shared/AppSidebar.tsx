import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  BarChart3,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Store,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Inventory",
    icon: Package,
    url: "/dashboard/inventory",
  },
  {
    title: "Billing",
    icon: Receipt,
    url: "/dashboard/billing",
  },
  {
    title: "Customers",
    icon: Users,
    url: "/dashboard/customers",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/dashboard/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-gradient-primary shadow-glow flex h-9 w-9 items-center justify-center rounded-xl">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-bold">Sajilo Khata</span>

            <span className="text-xs text-muted-foreground">
              Business Suite
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MAIN MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          Sajilo khata v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
