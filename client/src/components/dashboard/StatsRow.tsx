import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Receipt, TrendingUp, Wallet } from "lucide-react"
import type { DashboardStats } from "./data"
import { fetchStats } from "./data"

const toneMap = {
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
}

export default function StatsRow() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-soft">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const items = [
    {
      label: "Total Sales",
      value: `Rs ${stats.totalSales.toLocaleString()}`,
      delta: `${stats.totalProducts} products`,
      tone: "success" as const,
      icon: Wallet,
      hint: "all time",
    },
    {
      label: "Gross Profit",
      value: `Rs ${stats.grossProfit.toLocaleString()}`,
      delta: `Net: Rs ${stats.netProfit.toLocaleString()}`,
      tone: "success" as const,
      icon: TrendingUp,
      hint: "after expenses",
    },
    {
      label: "Total Expenses",
      value: `Rs ${stats.totalExpense.toLocaleString()}`,
      delta: `Purchase: Rs ${stats.totalPurchase.toLocaleString()}`,
      tone: "danger" as const,
      icon: Receipt,
      hint: "all time",
    },
    {
      label: "Customer Dues",
      value: `Rs ${stats.totalDue.toLocaleString()}`,
      delta: `${stats.lowStockCount} low stock`,
      tone: "warning" as const,
      icon: AlertTriangle,
      hint: "outstanding",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, delta, tone, icon: Icon, hint }) => (
        <Card key={label} className="shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneMap[tone]}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{value}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={`text-[11px] ${toneMap[tone]}`}
              >
                {delta}
              </Badge>
              {hint}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
