// src/pages/home/Modules.tsx
import {
  BarChart3,
  BookUser,
  Check,
  Package,
  Receipt,
  Shield,
  Zap,
} from "lucide-react"

const shopTypes = [
  "Kirana shops",
  "Cosmetic stores",
  "Mobile shops",
  "Hardware stores",
  "Small marts",
  "Wholesalers",
]

const modules = [
  ["Inventory", Package],
  ["Billing / POS", Receipt],
  ["Khata / Credit", BookUser],
  ["Analytics", BarChart3],
  ["Suppliers", Shield],
  ["Staff", Zap],
] as const

export default function ModulesSection() {
  return (
    <section id="modules" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-semibold tracking-widest text-primary uppercase">
              Built for every shop
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              One app. Every type of business.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Whether you sell daal-chamal, cosmetics, mobiles, or hardware —
              Sajilo khata adapts to your workflow.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {shopTypes.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <Check className="h-4 w-4 text-primary" /> {s}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map(([name, Icon]) => (
              <div
                key={name}
                className="shadow-soft rounded-2xl border border-border bg-card p-5"
              >
                <Icon className="h-5 w-5 text-primary" />
                <div className="mt-3 font-semibold">{name}</div>
                <div className="text-xs text-muted-foreground">
                  Beautifully integrated.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
