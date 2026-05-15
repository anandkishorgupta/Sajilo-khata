// src/pages/dashboard/components/ExpenseBreakdown.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { expenses } from "./data"

const total = expenses.reduce((s, x) => s + x.v, 0)

export default function ExpenseBreakdown() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expense Breakdown</CardTitle>
        <CardDescription>This month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.map((e) => {
          const pct = (e.v / total) * 100
          return (
            <div key={e.name}>
              <div className="flex justify-between text-sm">
                <span>{e.name}</span>
                <span className="font-semibold">Rs {e.v.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div
                  className="bg-gradient-primary h-full rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
