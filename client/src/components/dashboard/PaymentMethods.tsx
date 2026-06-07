import { useEffect, useState } from "react"
import { QrCode, Banknote, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { PaymentMethodData } from "./data"
import { fetchPaymentMethods } from "./data"

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "hsl(200 70% 50%)",
  "hsl(280 60% 55%)",
]

const methodIcons: Record<string, typeof QrCode> = {
  qr: QrCode,
  cash: Banknote,
  credit: CreditCard,
  bank: CreditCard,
}

const methodLabels: Record<string, string> = {
  qr: "QR / Wallet",
  cash: "Cash",
  credit: "Credit",
  bank: "Bank",
  mixed: "Mixed",
}

export default function PaymentMethods() {
  const [data, setData] = useState<PaymentMethodData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentMethods()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Payment Methods</CardTitle>
        <CardDescription>Collection split</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-44 w-44 rounded-full" />
        ) : data.length === 0 ? (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
            No payment data
          </div>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="percentage" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {data.map((p, i) => {
                const Icon = methodIcons[p.method] ?? Banknote
                return (
                  <div key={p.method} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <Icon className="h-3.5 w-3.5" />
                      {methodLabels[p.method] ?? p.method}
                    </span>
                    <span className="font-semibold">{p.percentage}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}