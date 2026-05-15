// src/pages/dashboard/components/RecentTransactions.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { txns } from "./data"

const methodTone: Record<string, string> = {
  QR: "bg-blue-500/10 text-blue-600 border-0",
  Cash: "bg-muted text-muted-foreground border-0",
  Credit: "bg-warning/10 text-warning border-0",
}

export default function RecentTransactions() {
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
                  <td className="py-3 font-mono text-xs">{t.id}</td>
                  <td className="py-3">
                    <div className="font-medium">{t.c}</div>
                    <div className="text-xs text-muted-foreground">{t.t}</div>
                  </td>
                  <td className="py-3">
                    <Badge className={methodTone[t.m]}>{t.m}</Badge>
                  </td>
                  <td className="py-3 text-right font-semibold">
                    Rs {t.a.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <Badge
                      className={
                        t.s === "paid"
                          ? "border-0 bg-success/10 text-success"
                          : "border-0 bg-warning/10 text-warning"
                      }
                    >
                      {t.s}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
