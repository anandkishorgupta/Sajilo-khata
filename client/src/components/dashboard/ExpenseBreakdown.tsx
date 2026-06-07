import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ExpenseBreakdownData } from "./data"
import { fetchExpenseBreakdown } from "./data"

export default function ExpenseBreakdown() {
  const [expenses, setExpenses] = useState<ExpenseBreakdownData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpenseBreakdown()
      .then(setExpenses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = expenses.reduce((s, x) => s + x.amount, 0)

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expense Breakdown</CardTitle>
        <CardDescription>By category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : expenses.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No expenses recorded
          </div>
        ) : (
          expenses.map((e) => {
            const pct = total > 0 ? (e.amount / total) * 100 : 0
            return (
              <div key={e.category}>
                <div className="flex justify-between text-sm">
                  <span>{e.category}</span>
                  <span className="font-semibold">
                    Rs {e.amount.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="bg-gradient-primary h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
