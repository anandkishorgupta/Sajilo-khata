// src/pages/home/Features.tsx
import {
  BarChart3,
  BookUser,
  Package,
  QrCode,
  Receipt,
  Smartphone,
} from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Smart inventory",
    desc: "Track stock, expiry and low-quantity alerts. Barcode + image support.",
  },
  {
    icon: Receipt,
    title: "Lightning billing",
    desc: "POS-style billing in seconds. QR + cash + credit, all on one screen.",
  },
  {
    icon: BookUser,
    title: "Digital khata",
    desc: "Replace paper ledgers. SMS reminders to customers with one tap.",
  },
  {
    icon: BarChart3,
    title: "Analytics that matter",
    desc: "See your top products, profit trends and busiest hours, beautifully.",
  },
  {
    icon: QrCode,
    title: "QR payments",
    desc: "Accept eSewa, Khalti, IME Pay & Fonepay directly into your reports.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    desc: "Run your shop from a phone, tablet or laptop. Syncs across devices.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-20">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold tracking-widest text-primary uppercase">
          Why Karobar Lite
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Everything your shop needs. Nothing it doesn't.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Designed with shop owners across Nepal — from Birgunj to Pokhara to
          Itahari. Simple enough for first-time users, powerful enough to scale.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group shadow-soft rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
