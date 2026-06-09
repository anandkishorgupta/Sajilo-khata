import type { Expense } from "@/api/expenses"
import { expenseApi } from "@/api/expenses"
import ExpenseForm from "@/components/expenses/ExpenseForm"
import { useEffect, useState } from "react"

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  Rent: { bg: "bg-purple-100", text: "text-purple-700", icon: "🏢" },
  Electricity: { bg: "bg-amber-100", text: "text-amber-700", icon: "⚡" },
  Water: { bg: "bg-blue-100", text: "text-blue-700", icon: "💧" },
  "Food & Drinks": { bg: "bg-green-100", text: "text-green-700", icon: "🥗" },
  Salary: { bg: "bg-pink-100", text: "text-pink-700", icon: "👥" },
  Transport: { bg: "bg-lime-100", text: "text-lime-700", icon: "🚗" },
  Other: { bg: "bg-gray-100", text: "text-gray-600", icon: "📦" },
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const fetchExpenses = async () => {
    setLoading(true)
    const data = await expenseApi.getAll()
    setExpenses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const deleteExpense = async (id: number) => {
    if (!confirm("Delete this expense?")) return
    await expenseApi.remove(id)
    fetchExpenses()
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const largest = expenses.length
    ? Math.max(...expenses.map((e) => Number(e.amount)))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm text-gray-500">Track your business spending</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          + Add Expense
        </button>
      </div>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon="🧾"
          iconBg="bg-teal-50"
          label="Total Expenses"
          value={`NPR ${total.toLocaleString()}`}
          sub="Till now"
        />
        <MetricCard
          icon="📋"
          iconBg="bg-purple-50"
          label="Transactions"
          value={expenses.length}
          sub="Recorded entries"
        />
        <MetricCard
          icon="📈"
          iconBg="bg-amber-50"
          label="Largest Expense"
          value={`NPR ${largest.toLocaleString()}`}
          sub="Single entry"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Recent Expenses</span>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-400">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No expenses yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const style =
                  CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES["Other"]
                return (
                  <tr key={e.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        {style.icon} {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Rs {Number(e.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(e?.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <ExpenseForm
              onClose={() => {
                setOpen(false)
                fetchExpenses()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: string
  iconBg: string
  label: string
  value: any
  sub: string
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div
        className={`h-8 w-8 ${iconBg} mb-3 flex items-center justify-center rounded-lg text-base`}
      >
        {icon}
      </div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
