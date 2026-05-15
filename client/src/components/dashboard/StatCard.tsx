import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: ReactNode
}

export default function StatCard({
  title,
  value,
  change,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </h3>

          <p className="mt-1 text-sm text-emerald-600">
            {change}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
          {icon}
        </div>
      </div>
    </div>
  )
}