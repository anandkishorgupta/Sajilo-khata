// src/pages/home/Hero.tsx
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Check,
  Database,
  Package,
  PenLine,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import DashboardPreview from "./DashboardPreview"
const CHAT_DEMO = [
  {
    id: 1,
    role: "user" as const,
    text: "What are today's total sales?",
  },
  {
    id: 2,
    role: "ai" as const,
    text: (
      <>
        Today's sales are{" "}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Rs 12,500
        </span>{" "}
        from <strong>8 transactions</strong>. Top seller: Basmati Rice.
      </>
    ),
  },
  {
    id: 3,
    role: "user" as const,
    text: "Sold 2kg rice and 1L mustard oil",
  },
  {
    id: 4,
    role: "ai" as const,
    isAction: true,
  },
]

const SUGGESTION_CHIPS = [
  "Which products are low on stock?",
  "How much do customers owe me?",
  "Purchased 50 soaps at Rs 25 each",
]

const FEATURES = [
  { icon: Package, label: "Inventory", desc: "Track stock, low-stock alerts" },
  { icon: Receipt, label: "Billing & POS", desc: "Fast billing, PDF invoices" },
  { icon: BookOpen, label: "Khata", desc: "Customer dues & credit ledger" },
  { icon: BarChart2, label: "Analytics", desc: "Sales trends & top products" },
]

const AI_CAPABILITIES = [
  {
    icon: Database,
    title: "Live data queries",
    desc: "Sales, stock, dues — answered instantly from your real shop data.",
  },
  {
    icon: PenLine,
    title: "Natural language entry",
    desc: "Record sales, purchases & expenses just by describing them.",
  },
  {
    icon: ShieldCheck,
    title: "Confirm before saving",
    desc: "Always shows a summary — nothing hits the database without your approval.",
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end justify-end gap-2">
      <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-emerald-600 px-3.5 py-2.5 text-sm leading-snug text-white">
        {text}
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        S
      </div>
    </div>
  )
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm leading-snug text-foreground">
        {children}
      </div>
    </div>
  )
}

function ActionCard() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm leading-snug text-foreground">
        <p className="mb-2">Here's what I'll record:</p>
        <div className="rounded-lg border border-border bg-background p-2.5 text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">Basmati Rice (2 kg)</span>
            <span className="font-medium">Rs 200</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">Mustard Oil (1 L)</span>
            <span className="font-medium">Rs 180</span>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-semibold">
            <span>Total</span>
            <span>Rs 380</span>
          </div>
        </div>
        <div className="mt-2.5 flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">
            <Check className="h-3 w-3" />
            Confirm
          </button>
          <button className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function AiChatPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium text-foreground">Sajilo AI</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Live shop data
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3.5 px-4 py-4">
        {CHAT_DEMO.map((msg) => {
          if (msg.role === "user") {
            return <UserBubble key={msg.id} text={msg.text as string} />
          }
          if (msg.isAction) {
            return <ActionCard key={msg.id} />
          }
          return <AiBubble key={msg.id}>{msg.text}</AiBubble>
        })}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        {SUGGESTION_CHIPS.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
export default function HeroSection() {
  return (
    <section className="bg-gradient-soft relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.16_155/0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="shadow-soft mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
            Now live across Nepal
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            The smart way to run your{" "}
            <span className="text-gradient">shop in Nepal</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Inventory, billing, khata and analytics — all in one beautiful app.
            Built for kirana shops, cosmetic stores, mobile shops, hardware
            stores and local wholesalers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="bg-gradient-primary shadow-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              Start free — 30 day trial <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted"
            >
              See how it works
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-success" /> AI support
            </span>
            {/* <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Nepali & English</span> */}
            {/* <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> eSewa & Khalti ready</span> */}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="rounded-3xl border border-border bg-card p-2 shadow-card">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-background">
              <DashboardPreview />
            </div>
          </div>
        </div>
        <div>
          {/* ── Divider ── */}
          <div className="my-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI assistant
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ── AI section ── */}
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Just say it — the AI handles it
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Ask questions, check live data, or record transactions in plain
                language. No forms, no clicks, no learning curve.
              </p>
            </div>

            {/* Chat demo */}
            <AiChatPreview />

            {/* Capability cards */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {AI_CAPABILITIES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-4 text-left"
                >
                  <Icon className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
