import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Plus,
  Package,
  ShoppingCart,
  CreditCard,
} from "lucide-react"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"

import StatCard from "./StatCard"
import SectionCard from "./SectionCard"

const revenueData = [
  { day: "Sun", sales: 12000 },
  { day: "Mon", sales: 18000 },
  { day: "Tue", sales: 15000 },
  { day: "Wed", sales: 24000 },
  { day: "Thu", sales: 28000 },
  { day: "Fri", sales: 32000 },
  { day: "Sat", sales: 38000 },
]

const topProducts = [
  {
    name: "Wai Wai Noodles",
    sold: 142,
  },
  {
    name: "Coca Cola 500ml",
    sold: 98,
  },
  {
    name: "Mustard Oil",
    sold: 74,
  },
]

const lowStock = [
  {
    name: "Rice 25KG",
    left: 2,
  },
  {
    name: "Sunflower Oil",
    left: 1,
  },
]

const transactions = [
  {
    customer: "Ram Bahadur",
    amount: "Rs 2,400",
    method: "QR",
  },
  {
    customer: "Sita Sharma",
    amount: "Rs 850",
    method: "Cash",
  },
  {
    customer: "Bikash Store",
    amount: "Rs 5,200",
    method: "Credit",
  },
]

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* HEADER */}
      <div className="border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Namaste, Ramesh 👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Here's your shop overview for today.
            </p>
          </div>

          <button className="hidden rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 lg:flex lg:items-center lg:gap-2">
            <Plus className="h-4 w-4" />
            New Sale
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6">
        {/* QUICK SUMMARY */}
        <div className="rounded-3xl bg-emerald-500 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">
                Today's Sales
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                Rs 24,580
              </h2>

              <p className="mt-2 text-sm text-white/90">
                +12% from yesterday
              </p>
            </div>

            <div className="rounded-3xl bg-white/20 p-4">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Profit"
            value="Rs 6,200"
            change="+8.2%"
            icon={<TrendingUp className="h-5 w-5" />}
          />

          <StatCard
            title="Customer Due"
            value="Rs 18,400"
            change="12 customers"
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          <StatCard
            title="Daily Expenses"
            value="Rs 3,420"
            change="-2.1%"
            icon={<Receipt className="h-5 w-5" />}
          />

          <StatCard
            title="Products"
            value="342"
            change="+14 new"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "New Billing",
              icon: <ShoppingCart className="h-5 w-5" />,
            },
            {
              title: "Add Product",
              icon: <Package className="h-5 w-5" />,
            },
            {
              title: "Add Expense",
              icon: <Receipt className="h-5 w-5" />,
            },
            {
              title: "Khata",
              icon: <CreditCard className="h-5 w-5" />,
            },
          ].map((item) => (
            <button
              key={item.title}
              className="rounded-3xl border bg-card p-5 text-left shadow-sm transition hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Quick Action
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {item.title}
                  </h3>
                </div>

                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  {item.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CHART + LOW STOCK */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Weekly Shop Sales"
            subtitle="Last 7 days revenue"
          >
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="sales"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="day" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    fill="url(#sales)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Low Stock Alerts"
            subtitle="Refill these products soon"
          >
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-red-200 bg-red-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Only {item.left} left
                      </p>
                    </div>

                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* TRANSACTIONS + TOP PRODUCTS */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Recent Transactions"
            subtitle="Latest customer payments"
          >
            <div className="space-y-3">
              {transactions.map((item) => (
                <div
                  key={item.customer}
                  className="flex items-center justify-between rounded-2xl border p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {item.customer}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {item.method}
                    </p>
                  </div>

                  <div className="font-semibold">
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Top Selling Products"
            subtitle="Best performers this week"
          >
            <div className="space-y-3">
              {topProducts.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-600">
                      #{index + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {item.sold} sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* MOBILE FLOATING BUTTON */}
      <button className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl lg:hidden">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}