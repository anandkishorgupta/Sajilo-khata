import type { ReactNode } from "react"

interface SectionCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function SectionCard({
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>

        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {children}
    </div>
  )
}
