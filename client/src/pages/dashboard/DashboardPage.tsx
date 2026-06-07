// src/pages/dashboard/index.tsx
import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import RevenueChart       from "@/components/dashboard/RevenueChart";
import PaymentMethods     from "@/components/dashboard/PaymentMethods";
import WeeklySales        from "@/components/dashboard/WeeklySales";
import LowStock           from "@/components/dashboard/LowStock";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TopProducts        from "@/components/dashboard/TopProducts";
import ExpenseBreakdown   from "@/components/dashboard/ExpenseBreakdown";
import InventoryStatus    from "@/components/dashboard/InventoryStatus";
import StatsRow from "@/components/dashboard/StatsRow";
import { fetchProfile } from "@/components/dashboard/data";

export default function DashboardPage() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    fetchProfile()
      .then((p) => setUserName(p.name))
      .catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col gap-1 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {userName ? `Good ${getGreeting()}, ${userName} 👋` : `Good ${getGreeting()} 👋`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening in your shop today, {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow" asChild>
            <Link to="/dashboard/billing">
              <Plus className="h-4 w-4" /> New sale
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4">
        <StatsRow />
      </div>

      {/* Revenue + Payment Methods */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <RevenueChart />
        <PaymentMethods />
      </div>

      {/* Weekly Sales + Low Stock */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <WeeklySales />
        <LowStock />
      </div>

      {/* Recent Transactions + Top Products */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <RecentTransactions />
        <TopProducts />
      </div>

      {/* Expense Breakdown + Inventory */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ExpenseBreakdown />
        <InventoryStatus />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}