import { usePosSession } from "@/hooks/usePosSession"
import { useScanSocket } from "@/hooks/useScanSocket"
import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

type ScannerPairingProps = {
  open: boolean
  onClose: () => void
}

export function ScannerPairing({
  open,
  onClose,
}: ScannerPairingProps) {
  const { sessionCode, createSession, loading } = usePosSession()

  // Socket stays connected because this component never unmounts
  useScanSocket(sessionCode)

  useEffect(() => {
    createSession()
  }, [])

  console.log("sessionCode:", sessionCode)

  const pairingUrl = sessionCode
    ? `${window.location.origin}/scan?session=${sessionCode}`
    : null

  // Hide UI only
  if (!open) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-6">
          <p className="text-sm text-gray-500">Generating session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative rounded-xl bg-white p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-gray-700">
            Scan to pair phone scanner
          </p>

          {pairingUrl && (
            <QRCodeSVG
              value={pairingUrl}
              size={160}
            />
          )}

          <p className="font-mono text-xs text-gray-400">
            {sessionCode}
          </p>

          <button
            onClick={createSession}
            className="text-xs text-blue-500 underline"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}