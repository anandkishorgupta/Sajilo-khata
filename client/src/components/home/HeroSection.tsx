// src/pages/home/Hero.tsx
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import DashboardPreview from "./DashboardPreview"

export default function HeroSection() {
  return (
    <section className="bg-gradient-soft relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.16_155/0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="shadow-soft mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
            Now live across Nepal
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            The smart way to run your{" "}
            <span className="text-gradient">shop in Nepal</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Inventory, billing, khata and analytics — all in one beautiful app.
            Built for kirana shops, cosmetic stores, mobile shops, hardware
            stores and local wholesalers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="bg-gradient-primary shadow-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              Start free — 30 day trial <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted"
            >
              See how it works
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {/* <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Works offline</span> */}
            {/* <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Nepali & English</span> */}
            {/* <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> eSewa & Khalti ready</span> */}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="rounded-3xl border border-border bg-card p-2 shadow-card">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-background">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
