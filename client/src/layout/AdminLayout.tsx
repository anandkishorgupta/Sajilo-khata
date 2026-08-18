import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { adminLogout } from "@/store/slices/adminSlice"
import { Shield, LayoutDashboard, Store, Users, CreditCard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/shops", icon: Store, label: "Shops" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/payments", icon: CreditCard, label: "Payments" },
]

export default function AdminLayout() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const admin = useSelector((state: RootState) => state.adminAuth.admin)

    const handleLogout = () => {
        dispatch(adminLogout())
        navigate("/admin/login")
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-background">
                <div className="flex items-center gap-2 border-b px-6 py-4">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Admin Panel</span>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t px-3 py-4">
                    <div className="mb-3 px-3 text-sm">
                        <p className="font-medium">{admin?.name}</p>
                        <p className="text-xs text-muted-foreground">{admin?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}
