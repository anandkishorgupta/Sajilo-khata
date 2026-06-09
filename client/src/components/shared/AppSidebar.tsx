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
  BookOpen,
  Bot,
  Crown,
  DollarSign,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Store,
  Tags,
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
    title: "Category",
    icon: Tags,
    url: "/dashboard/categories",
  },
  {
    title: "Expense",
    icon: DollarSign,
    url: "/dashboard/expenses",
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
    title: "Khata",
    icon: BookOpen,
    url: "/dashboard/khata",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/dashboard/analytics",
  },
  {
    title: "AI Assistant",
    icon: Bot,
    url: "/dashboard/ai-assistant",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
]

export function AppSidebar() {
  const shop = JSON.parse(localStorage.getItem("shop") || "null")

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const plan = shop?.plan || "free"

  const getPlanIcon = (plan?: string) => {
    switch (plan) {
      case "trial":
        return <Sparkles className="h-3 w-3 text-yellow-500" />

      case "pro":
      case "paid":
      case "premium":
        return <Crown className="h-3 w-3 text-yellow-500" />

      default:
        return <Sparkles className="h-3 w-3 text-muted-foreground" />
    }
  }
  return (
    <Sidebar collapsible="icon">
      {/* HEADER */}
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

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          {/* SHOP CARD */}
          {shop && (
            <div className="px-3 pb-3">
              <button className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-left text-sm transition hover:bg-sidebar-accent">
                {/* Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-soft text-xs font-bold text-primary">
                  {getInitials(shop.name)}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="text-md truncate font-semibold">
                    {shop.name}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="flex gap-1 capitalize">
                      {getPlanIcon(shop?.plan)}
                      {shop?.plan || "free"} plan
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* MENU */}
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

      {/* FOOTER */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          Sajilo khata v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
