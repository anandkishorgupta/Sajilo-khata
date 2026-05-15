// src/pages/home/CTA.tsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center shadow-glow sm:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(1_0_0/0.2),transparent_50%)]" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
            Ready to modernize your shop?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Join thousands of Nepali businesses growing with Karobar Lite.
          </p>
          <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:scale-[1.02]">
            Open the dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}