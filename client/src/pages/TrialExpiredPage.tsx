// src/pages/TrialExpiredPage.tsx
import { api } from "@/services/api-client"
import { ArrowRight, Database, Phone, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

const PLAN_FEATURES = [
  "Unlimited billing & invoices",
  "Full inventory management",
  "Khata & customer credit ledger",
  "AI assistant for your shop",
  "Sales analytics & reports",
  "Priority support",
]

export default function TrialExpiredPage() {
  const handleUpgrade = async () => {
    try {
      const res = await api.post("/payments/initiate")
      console.log("Payment initiation response:", res)
      // Redirect to Khalti payment page
      window.location.href = res.data.data.payment_url
    } catch (err) {
      toast.error("Could not initiate payment. Try again.")
    }
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16">
      {/* Brand */}
      <Link
        to="/"
        className="mb-10 text-lg font-bold tracking-tight text-foreground"
      >
        Sajilo <span className="text-emerald-600">Khata</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Status card */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
            <svg
              className="h-7 w-7 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-foreground">
            Your free trial has ended
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your 7-day trial is over. Upgrade to keep access to your shop data,
            billing, khata, and AI assistant.
          </p>

          {/* Data safety notice */}
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-left dark:bg-emerald-950">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Your shop data is safe. We keep it for 30 days — upgrade anytime
              to pick up right where you left off.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/upgrade"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Upgrade now <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="tel:+977XXXXXXXXXX"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Phone className="h-4 w-4" />
            Talk to us
          </a>
        </div>

        {/* Features included */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            What you get with Pro
          </p>
          <ul className="space-y-2.5">
            {PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sm text-foreground"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:support@sajilokhata.com"
            className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
          >
            support@sajilokhata.com
          </a>
        </p>
      </div>
      <button
        onClick={handleUpgrade}
        className="mt-6 cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Upgrade now — Rs 5/month
      </button>
    </div>
  )
}
