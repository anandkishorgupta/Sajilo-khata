import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"
import type { InventoryStatusData } from "./data"
import { fetchInventoryStatus } from "./data"
import { Link } from "react-router-dom"

export default function InventoryStatus() {
  const [data, setData] = useState<InventoryStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryStatus()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="shadow-soft lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Inventory Status</CardTitle>
          <CardDescription>Across all categories</CardDescription>
        </div>
        {data && data.lowStockCount === 0 && (
          <Badge className="border-0 bg-success/10 text-success">Healthy</Badge>
        )}
        {data && data.lowStockCount > 0 && (
          <Badge className="border-0 bg-warning/10 text-warning">
            {data.lowStockCount} low
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !data ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No inventory data
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground">Total products</div>
                <div className="mt-1 font-display text-xl font-bold">
                  {data.totalProducts}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground">Stock value</div>
                <div className="mt-1 font-display text-xl font-bold">
                  Rs {data.stockValue.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Cost basis
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground">Low stock</div>
                <div className="mt-1 font-display text-xl font-bold">
                  {data.lowStockCount}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  needs reorder
                </div>
              </div>
            </div>
            {data.lowStockCount > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/10 p-4">
                <Package className="h-5 w-5 text-primary" />
                <p className="text-sm">
                  <span className="font-semibold">{data.lowStockCount} products</span>{" "}
                  are running low.{" "}
                  <Link
                    to="/dashboard/inventory"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Review now
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
