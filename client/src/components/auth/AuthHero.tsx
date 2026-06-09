import { Check, Gift, Shield } from "lucide-react"

const features = [
  "Unlimited products during trial",
  // "QR billing with eSewa & Khalti",
  "Digital khata management",
  "Daily sales analytics",
  "Works on mobile and desktop",
]

export function AuthHero() {
  return (
    <section className="hidden lg:block">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-600">
        <Gift className="h-4 w-4" />
        30-day free trial
      </div>

      <h1 className="mt-6 text-5xl leading-tight font-bold tracking-tight">
        Run your shop
        <span className="block text-emerald-600">the smart way.</span>
      </h1>

      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Inventory, billing, khata and analytics built for local businesses in
        Nepal.
      </p>

      <div className="mt-10 space-y-4">
        {features.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Check className="h-4 w-4" />
            </div>

            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <Shield className="h-5 w-5" />
        </div>

        <div>
          <div className="font-semibold">Your data is safe</div>

          <div className="text-sm text-muted-foreground">Encrypted</div>
        </div>
      </div>
    </section>
  )
}
