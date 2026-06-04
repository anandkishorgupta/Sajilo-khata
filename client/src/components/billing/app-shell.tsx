import React from "react"

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AppShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
