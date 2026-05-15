// src/pages/dashboard/components/TopProducts.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { topProducts } from "./data"

export default function TopProducts() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Selling Products</CardTitle>
        <CardDescription>This week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topProducts.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              #{i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.sold} units sold
              </div>
            </div>
            <div className="text-sm font-semibold">
              Rs {p.rev.toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
