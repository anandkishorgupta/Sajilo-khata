import { useState, useEffect } from "react"
import type {
  DashboardStats,
  SalesChartPoint,
  TopProduct,
  LowStockProduct,
  DueAnalytics,
} from "@/api/analytics"
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getLowStock,
  getDueAnalytics,
} from "@/api/analytics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react"
import toast from "react-hot-toast"

const fmt = (n: number) =>
  `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesChart, setSalesChart] = useState<SalesChartPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [due, setDue] = useState<DueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [statsRes, chartRes, topRes, lowRes, dueRes] = await Promise.all([
        getDashboardStats(),
        getSalesChart(),
        getTopProducts(),
        getLowStock(),
        getDueAnalytics(),
      ])
      setStats(statsRes.data?.data ?? statsRes.data)
      setSalesChart(chartRes.data?.data ?? chartRes.data ?? [])
      setTopProducts(topRes.data?.data ?? topRes.data ?? [])
      setLowStock(lowRes.data?.data ?? lowRes.data ?? [])
      setDue(dueRes.data?.data ?? dueRes.data)
    } catch {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats
    ? [
        {
          label: "Total Sales",
          value: fmt(stats.totalSales),
          icon: Wallet,
          tone: "text-green-600 bg-green-50",
        },
        {
          label: "Total Purchases",
          value: fmt(stats.totalPurchase),
          icon: ShoppingCart,
          tone: "text-blue-600 bg-blue-50",
        },
        {
          label: "Total Expenses",
          value: fmt(stats.totalExpense),
          icon: Receipt,
          tone: "text-orange-600 bg-orange-50",
        },
        {
          label: "Net Profit",
          value: fmt(stats.netProfit),
          icon: TrendingUp,
          tone: stats.netProfit >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
        },
        {
          label: "Gross Profit",
          value: fmt(stats.grossProfit),
          icon: DollarSign,
          tone: "text-emerald-600 bg-emerald-50",
        },
        {
          label: "Total Due",
          value: fmt(stats.totalDue),
          icon: AlertTriangle,
          tone: "text-amber-600 bg-amber-50",
        },
        {
          label: "Total Products",
          value: String(stats.totalProducts),
          icon: Package,
          tone: "text-violet-600 bg-violet-50",
        },
        {
          label: "Low Stock Items",
          value: String(stats.lowStockCount),
          icon: AlertTriangle,
          tone: stats.lowStockCount > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50",
        },
      ]
    : []

  // Due breakdown pie
  const dueChartData = due
    ? [
        { name: "Paid", value: due.totalPayment, fill: "#22c55e" },
        { name: "Remaining Due", value: due.remainingDue, fill: "#ef4444" },
      ]
    : []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Business overview and insights
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Trend</CardTitle>
          <CardDescription>Daily sales amount over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : salesChart.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No sales data yet
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                    formatter={(v: number) => [fmt(v), "Sales"]}
                    labelFormatter={(l) => new Date(l).toLocaleDateString()}
                  />
                  <Area
                    dataKey="amount"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products + Due Analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>Ranked by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales data yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((tp, i) => (
                    <TableRow key={tp.product.id}>
                      <TableCell>
                        <Badge variant={i < 3 ? "default" : "secondary"}>
                          {i + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {tp.product.name}
                      </TableCell>
                      <TableCell className="text-right">{tp.quantity}</TableCell>
                      <TableCell className="text-right">
                        {fmt(tp.quantity * Number(tp.product.sellingPrice))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Due Analytics Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit & Payments</CardTitle>
            <CardDescription>Khata overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-48 w-48 rounded-full" />
            ) : !due || (due.totalCredit === 0 && due.totalPayment === 0) ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No credit data yet
              </p>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dueChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dueChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                      Total Credit
                    </span>
                    <span className="font-medium">{fmt(due.totalCredit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-green-500" />
                      Total Paid
                    </span>
                    <span className="font-medium">{fmt(due.totalPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 text-sm font-bold">
                    <span>Remaining Due</span>
                    <span className="text-red-600">{fmt(due.remainingDue)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock + Profit Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
            <CardDescription>Products below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Package className="h-10 w-10 text-green-400" />
                <p className="mt-2 text-sm text-muted-foreground">
                  All products are well stocked
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((p) => {
                  const pct = Math.min((p.stock / p.lowStockLimit) * 100, 100)
                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">
                          {p.stock} / {p.lowStockLimit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct <= 25
                              ? "bg-red-500"
                              : pct <= 50
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Summary</CardTitle>
            <CardDescription>Sales vs Purchases vs Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Sales", value: stats.totalSales, fill: "#22c55e" },
                      { name: "Purchases", value: stats.totalPurchase, fill: "#3b82f6" },
                      { name: "Expenses", value: stats.totalExpense, fill: "#f97316" },
                      { name: "Net Profit", value: Math.max(stats.netProfit, 0), fill: "#8b5cf6" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                      }}
                      formatter={(v: number) => [fmt(v)]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {[
                        { fill: "#22c55e" },
                        { fill: "#3b82f6" },
                        { fill: "#f97316" },
                        { fill: "#8b5cf6" },
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
