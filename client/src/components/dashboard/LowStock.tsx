// src/pages/dashboard/components/LowStock.tsx
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lowStock } from "./data";

export default function LowStock() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          <CardDescription>Reorder soon</CardDescription>
        </div>
        <Badge variant="destructive">{lowStock.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStock.map((p) => (
          <div key={p.name} className="rounded-xl border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Min stock: {p.min}</div>
              </div>
              <Badge variant={p.left <= 2 ? "destructive" : "outline"} className={p.left > 2 ? "text-warning border-warning" : ""}>
                {p.left} left
              </Badge>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-destructive transition-all" style={{ width: `${(p.left / p.min) * 100}%` }} />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full border-dashed text-xs text-muted-foreground">
          View all <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}