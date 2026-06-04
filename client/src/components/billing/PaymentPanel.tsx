import { Banknote, BookUser, QrCode } from "lucide-react"

type Props = {
  method: "qr" | "cash" | "credit"
  total: number
  onMethodChange: (method: "qr" | "cash" | "credit") => void
  onCompleteSale: () => void
}

export function PaymentPanel({
  method,
  total,
  onMethodChange,
  onCompleteSale,
}: Props) {
  const methods = [
    { k: "qr", label: "QR", icon: QrCode },
    { k: "cash", label: "Cash", icon: Banknote },
    { k: "credit", label: "Khata", icon: BookUser },
  ] as const

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => (
          <button
            key={m.k}
            onClick={() => onMethodChange(m.k)}
            className={`rounded-lg border p-2 transition ${
              method === m.k
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:bg-muted"
            }`}
          >
            <m.icon className="mx-auto mb-2 h-6 w-6" />
            <p className="text-xs">{m.label}</p>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={onCompleteSale}
          className="w-full rounded-xl bg-green-600 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Complete Sale • Rs {total}
        </button>
      </div>
    </>
  )
}
