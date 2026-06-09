import { expenseApi } from "@/api/expenses";
import { useState } from "react";

const CATEGORIES = [
  { label: "Rent",          icon: "🏢" },
  { label: "Electricity",   icon: "⚡" },
  { label: "Water",         icon: "💧" },
  { label: "Food & Drinks", icon: "🥗" },
  { label: "Salary",        icon: "👥" },
  { label: "Transport",     icon: "🚗" },
  { label: "Other",         icon: "📦" },
];

const CHIP_ACTIVE: Record<string, string> = {
  Rent:           "bg-purple-100 text-purple-700 border-purple-300",
  Electricity:    "bg-amber-100 text-amber-700 border-amber-300",
  Water:          "bg-blue-100 text-blue-700 border-blue-300",
  "Food & Drinks":"bg-green-100 text-green-700 border-green-300",
  Salary:         "bg-pink-100 text-pink-700 border-pink-300",
  Transport:      "bg-lime-100 text-lime-700 border-lime-300",
  Other:          "bg-gray-100 text-gray-600 border-gray-300",
};

export default function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "", note: "", date: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title || !form.amount) return alert("Fill required fields");
    setLoading(true);
    await expenseApi.create({
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      date: form.date,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-base font-semibold">New Expense</h2>
          <p className="text-xs text-gray-400 mt-0.5">Add a business expense record</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 border rounded-lg p-1">✕</button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        <Field label="Title">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Office rent, NEA bill…"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (NPR)">
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Category">
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIES.map(({ label, icon }) => {
              const isActive = form.category === label;
              return (
                <button
                  key={label}
                  onClick={() => setForm({ ...form, category: label })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    isActive ? CHIP_ACTIVE[label] : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Note (optional)">
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            placeholder="Any extra details…"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-5 py-4 border-t">
        <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save Expense"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      {children}
    </div>
  );
}