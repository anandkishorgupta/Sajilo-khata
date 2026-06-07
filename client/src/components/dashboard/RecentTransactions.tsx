import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecentTransaction } from "./data"
import { fetchRecentTransactions } from "./data"

const methodTone: Record<string, string> = {
  qr: "bg-blue-500/10 text-blue-600 border-0",
  cash: "bg-muted text-muted-foreground border-0",
  credit: "bg-warning/10 text-warning border-0",
  bank: "bg-green-500/10 text-green-600 border-0",
  mixed: "bg-purple-500/10 text-purple-600 border-0",
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function RecentTransactions() {
  const [txns, setTxns] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentTransactions()
      .then(setTxns)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="shadow-soft lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <CardDescription>Latest billing activity</CardDescription>
        </div>
        <Button
          variant="link"
          className="h-auto p-0 text-xs font-semibold text-primary"
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txns.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-muted/40">
                    <td className="py-3 font-mono text-xs">{t.invoiceNumber}</td>
                    <td className="py-3">
                      <div className="font-medium">{t.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(t.createdAt)}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={methodTone[t.paymentMethod] ?? methodTone.cash}>
                        {t.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      Rs {t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        className={
                          t.paymentStatus === "paid"
                            ? "border-0 bg-success/10 text-success"
                            : "border-0 bg-warning/10 text-warning"
                        }
                      >
                        {t.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
