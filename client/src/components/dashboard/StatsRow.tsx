// src/pages/dashboard/components/StatsRow.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Receipt, TrendingUp, Wallet } from "lucide-react"

const stats = [
  {
    label: "Today's Sales",
    value: "Rs 24,580",
    delta: "+12.4%",
    tone: "success",
    icon: Wallet,
    hint: "vs yesterday",
  },
  {
    label: "Today's Profit",
    value: "Rs 6,210",
    delta: "+8.1%",
    tone: "success",
    icon: TrendingUp,
    hint: "margin 25.3%",
  },
  {
    label: "Daily Expenses",
    value: "Rs 3,420",
    delta: "-2.1%",
    tone: "danger",
    icon: Receipt,
    hint: "5 entries",
  },
  {
    label: "Customer Dues",
    value: "Rs 18,400",
    delta: "12 khata",
    tone: "warning",
    icon: AlertTriangle,
    hint: "due this week",
  },
] as const

const toneMap = {
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
}

export default function StatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, delta, tone, icon: Icon, hint }) => (
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
