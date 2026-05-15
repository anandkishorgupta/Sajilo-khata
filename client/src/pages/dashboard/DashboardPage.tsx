// src/pages/dashboard/index.tsx
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevenueChart       from "@/components/dashboard/RevenueChart";
import PaymentMethods     from "@/components/dashboard/PaymentMethods";
import WeeklySales        from "@/components/dashboard/WeeklySales";
import LowStock           from "@/components/dashboard/LowStock";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TopProducts        from "@/components/dashboard/TopProducts";
import ExpenseBreakdown   from "@/components/dashboard/ExpenseBreakdown";
import InventoryStatus    from "@/components/dashboard/InventoryStatus";
import StatsRow from "@/components/dashboard/StatsRow";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-1 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Good morning, Ramesh 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening in your shop today, Sun, Magh 28
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> New sale
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