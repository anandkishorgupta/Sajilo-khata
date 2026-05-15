// src/pages/dashboard/components/InventoryStatus.tsx
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Package } from "lucide-react"
import { lowStock } from "./data"

const stats = [
  { l: "Total products", v: "342", h: "+12 this week" },
  { l: "Stock value", v: "Rs 4,82,300", h: "Cost basis" },
  { l: "Categories", v: "18", h: "6 fast-moving" },
]

export default function InventoryStatus() {
  return (
    <Card className="shadow-soft lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Inventory Status</CardTitle>
          <CardDescription>Across all categories</CardDescription>
        </div>
        <Badge className="border-0 bg-success/10 text-success">Healthy</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-1 font-display text-xl font-bold">{s.v}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {s.h}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/10 p-4">
          <Package className="h-5 w-5 text-primary" />
          <p className="text-sm">
            <span className="font-semibold">{lowStock.length} products</span>{" "}
            are running low.{" "}
            <a
              href="#"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Review now
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
