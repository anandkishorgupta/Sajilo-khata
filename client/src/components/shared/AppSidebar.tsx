import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  BarChart3,
  Settings,
  Store,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    url: "/products",
  },
  {
    title: "Billing",
    icon: Receipt,
    url: "/billing",
  },
  {
    title: "Customers",
    icon: Users,
    url: "/customers",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-bold">
              Sajilo Khata
            </span>

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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          Karobar Lite v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}