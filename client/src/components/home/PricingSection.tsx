// src/pages/home/Pricing.tsx
import { Check } from "lucide-react"
import { Link } from "react-router-dom"

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For new shops getting started",
    feats: ["Up to 50 products", "Basic billing", "1 user"],
  },
  {
    name: "Business",
    price: "Rs 499",
    suffix: "/mo",
    featured: true,
    desc: "Most popular for kirana & cosmetic",
    feats: [
      "Unlimited products",
      "Khata + reminders",
      "QR payments",
      "Up to 5 staff",
    ],
  },
  {
    name: "Pro",
    price: "Rs 1,299",
    suffix: "/mo",
    desc: "For wholesalers & multi-outlet",
    feats: [
      "Multi-outlet",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-primary uppercase">
            Pricing
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Fair pricing for every shop
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            No hidden fees. Cancel anytime. All prices in NPR.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`shadow-soft relative rounded-2xl border p-6 ${p.featured ? "shadow-glow border-primary bg-card" : "border-border bg-card"}`}
            >
              {p.featured && (
                <div className="bg-gradient-primary absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                  Most popular
                </div>
              )}
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">
                  {p.price}
                </span>
                {p.suffix && (
                  <span className="text-sm text-muted-foreground">
                    {p.suffix}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${p.featured ? "bg-gradient-primary shadow-glow text-primary-foreground" : "border border-border hover:bg-muted"}`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
