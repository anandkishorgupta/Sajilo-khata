import { ArrowRight, Store } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
export function Header() {
  const location = useLocation()
  const hideNav =
    location.pathname === "/login" || location.pathname === "/register"

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
            <Store className="h-5 w-5" />
          </div>

          <span className="text-lg font-bold tracking-tight">Sajilo Khata</span>
        </Link>

        {/* <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </a>

          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>

          <a
            href="#testimonials"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Customers
          </a>
        </nav> */}
        {!hideNav && (
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </a>

            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Customers
            </a>
          </nav>
        )}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted sm:inline-flex"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
