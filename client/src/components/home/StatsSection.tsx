// src/pages/home/StatsStrip.tsx
const stats = [
  ["12,000+", "Active shops"],
  ["NPR 4.2B", "Sales processed"],
  ["99.9%", "Uptime"],
  ["47", "Districts"],
];

export default function StatsSection() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-5 py-10 sm:grid-cols-4">
        {stats.map(([v, l]) => (
          <div key={l} className="text-center">
            <div className="font-display text-2xl font-bold sm:text-3xl">{v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}