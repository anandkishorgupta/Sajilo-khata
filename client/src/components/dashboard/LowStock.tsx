import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { LowStockProduct } from "./data"
import { fetchLowStock } from "./data"
import { Link } from "react-router-dom"

export default function LowStock() {
  const [items, setItems] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStock()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          <CardDescription>Reorder soon</CardDescription>
        </div>
        <Badge variant="destructive">{items.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            All products are well stocked
          </div>
        ) : (
          items.slice(0, 5).map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Min stock: {p.lowStockLimit}
                  </div>
                </div>
                <Badge
                  variant={p.stock <= 2 ? "destructive" : "outline"}
                  className={p.stock > 2 ? "text-warning border-warning" : ""}
                >
                  {p.stock} left
                </Badge>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-destructive transition-all"
                  style={{
                    width: `${Math.min((p.stock / p.lowStockLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
        <Button
          variant="outline"
          className="w-full border-dashed text-xs text-muted-foreground"
          asChild
        >
          <Link to="/dashboard/inventory">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}