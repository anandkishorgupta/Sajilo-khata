// src/pages/home/Testimonials.tsx
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sita Maharjan",
    shop: "Maharjan Cosmetics, Lalitpur",
    quote:
      "Khata management saved me hours every week. Customers actually pay on time now.",
  },
  {
    name: "Bikash Thapa",
    shop: "Thapa Mobile Center, Pokhara",
    quote: "Billing is so fast. My helper learned it in 10 minutes.",
  },
  {
    name: "Anita Yadav",
    shop: "Yadav Kirana, Birgunj",
    quote:
      "Low-stock alerts mean I never run out of daal or tel. Profit up 22%.",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-5 py-20">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold tracking-widest text-primary uppercase">
          Loved by shop owners
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          From Kathmandu to Kakarbhitta
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="shadow-soft rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {t.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.shop}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
