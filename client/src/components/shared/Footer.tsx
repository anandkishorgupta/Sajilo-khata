import { Store } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Store className="h-4 w-4" />
          </div>

          <span className="font-semibold text-foreground">Sajilo Khata</span>
        </div>

        <div>© 2026 Sajilo Khata. All rights reserved.</div>
      </div>
    </footer>
  )
}
