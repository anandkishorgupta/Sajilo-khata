import { useEffect, useState } from "react"
import { getAdminStats } from "@/api/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Store, Users, DollarSign, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

type Stats = {
    totalShops: number
    activeShops: number
    expiredShops: number
    totalUsers: number
    totalSales: number
    totalPurchases: number
    totalExpenses: number
    totalPayments: number
    completedPayments: number
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function formatCurrency(amount: number) {
    if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}K`
    return `Rs ${amount}`
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .catch(() => toast.error("Failed to load stats"))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-24 animate-pulse bg-muted" />
                ))}
            </div>
        )
    }

    if (!stats) return <p className="text-muted-foreground">No data available</p>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Platform Overview</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={Store} label="Total Shops" value={stats.totalShops} color="bg-blue-500" />
                <StatCard icon={Store} label="Active Subscriptions" value={stats.activeShops} color="bg-green-500" />
                <StatCard icon={AlertTriangle} label="Expired Shops" value={stats.expiredShops} color="bg-red-500" />
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-purple-500" />
                <StatCard icon={TrendingUp} label="Total Sales" value={formatCurrency(stats.totalSales)} color="bg-emerald-500" />
                <StatCard icon={CreditCard} label="Payments Received" value={formatCurrency(stats.totalPayments)} color="bg-amber-500" />
            </div>
        </div>
    )
}
