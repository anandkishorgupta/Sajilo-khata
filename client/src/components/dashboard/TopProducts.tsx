import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TopProductData } from "./data"
import { fetchTopProducts } from "./data"

export default function TopProducts() {
  const [products, setProducts] = useState<TopProductData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Selling Products</CardTitle>
        <CardDescription>By quantity sold</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))
        ) : products.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No sales data yet
          </div>
        ) : (
          products.slice(0, 5).map((p, i) => (
            <div key={p.product.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                #{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {p.product.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.quantity} units sold
                </div>
              </div>
              <div className="text-sm font-semibold">
                Rs {(p.quantity * Number(p.product.sellingPrice)).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
