import { usePosSession } from "@/hooks/usePosSession"
import { useScanSocket } from "@/hooks/useScanSocket"
import { Check, Copy, Maximize2, Minimize2, Smartphone, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"

type ScannerPairingProps = {
  open: boolean
  onClose: () => void
}

export function ScannerPairing({ open, onClose }: ScannerPairingProps) {
  const { sessionCode, createSession, loading } = usePosSession()
  const [minimized, setMinimized] = useState(false)
  const [copied, setCopied] = useState(false)

  // Socket stays connected regardless of minimized/open state, since this
  // component never unmounts — only its render output changes.
  useScanSocket(sessionCode)
  // TODO: once useScanSocket exposes a live connection flag (e.g.
  // `phoneConnected`), use it below to auto-minimize the instant the phone
  // pairs, and to swap the pill's status dot from "waiting" to "connected".

  useEffect(() => {
    createSession()
  }, [])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  // Fresh session → always start from the full view, not minimized
  useEffect(() => {
    setMinimized(false)
  }, [sessionCode])

  const pairingUrl = sessionCode
    ? `${window.location.origin}/scan?session=${sessionCode}`
    : null

  const handleCopy = async () => {
    if (!pairingUrl) return
    try {
      await navigator.clipboard.writeText(pairingUrl)
      setCopied(true)
    } catch {
      // clipboard blocked — code is still visible, fail silently
    }
  }

  if (!open) return null

  // ── Minimized: floating pill, dashboard stays fully usable underneath ──
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pr-3.5 pl-2 shadow-lg transition hover:shadow-xl"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Smartphone size={14} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </span>
        <span className="text-xs font-medium text-slate-700">
          Phone scanner paired
        </span>
        <Maximize2 size={13} className="text-slate-400" />
      </button>
    )
  }

  // ── Full pairing modal ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="pairing-modal-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl">
        <style>{`
          @keyframes pairingIn {
            from { opacity: 0; transform: translateY(6px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .pairing-modal-in { animation: pairingIn 0.18s ease-out; }
          @media (prefers-reduced-motion: reduce) {
            .pairing-modal-in { animation: none; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Pair your phone
              </h2>
              <p className="text-xs text-slate-500">
                Scan, then minimize to keep working
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              aria-label="Minimize"
              title="Minimize and keep scanning in the background"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-xs text-slate-400">Generating session…</p>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-5">
            <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
              {["tl", "tr", "bl", "br"].map((corner) => (
                <div
                  key={corner}
                  className={`absolute h-7 w-7 border-blue-500 ${
                    corner === "tl"
                      ? "top-0 left-0 rounded-tl-md border-t-2 border-l-2"
                      : corner === "tr"
                        ? "top-0 right-0 rounded-tr-md border-t-2 border-r-2"
                        : corner === "bl"
                          ? "bottom-0 left-0 rounded-bl-md border-b-2 border-l-2"
                          : "right-0 bottom-0 rounded-br-md border-r-2 border-b-2"
                  }`}
                />
              ))}
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-white p-2">
                {pairingUrl && <QRCodeSVG value={pairingUrl} size={144} />}
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Open your phone's camera and scan this code
            </p>

            {/* Session code + copy link */}
            <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="truncate font-mono text-xs text-slate-600">
                {sessionCode}
              </span>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-blue-600"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy link
                  </>
                )}
              </button>
            </div>

            {/* <button
              onClick={createSession}
              className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <RefreshCw size={12} />
              Regenerate session
            </button> */}
          </div>
        )}
      </div>
    </div>
  )
}
