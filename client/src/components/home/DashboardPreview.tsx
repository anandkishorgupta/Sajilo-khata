// src/pages/home/DashboardPreview.tsx
import { TrendingUp } from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
      {[
        { label: "Today's Sales", value: "Rs 24,580", delta: "+12.4%" },
        { label: "Today's Profit", value: "Rs 6,210", delta: "+8.1%" },
        { label: "Pending Khata", value: "Rs 18,400", delta: "12 customers" },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
          <div className="mt-2 font-display text-xl font-bold">{s.value}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
            <TrendingUp className="h-3 w-3" /> {s.delta}
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:col-span-2">
        <div className="text-sm font-semibold">Monthly Revenue</div>
        <div className="mt-3 flex h-32 items-end gap-1.5">
          {[40, 55, 35, 65, 48, 72, 60, 80, 68, 90, 75, 95].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="text-sm font-semibold">Payment Methods</div>
        <div className="mt-3 space-y-2 text-xs">
          {[["QR", 62, "bg-primary"], ["Cash", 28, "bg-accent"], ["Credit", 10, "bg-warning"]].map(([n, p, c]) => (
            <div key={n as string}>
              <div className="flex justify-between">
                <span>{n as string}</span>
                <span className="font-semibold">{p}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className={`h-full rounded-full ${c as string}`} style={{ width: `${p}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}