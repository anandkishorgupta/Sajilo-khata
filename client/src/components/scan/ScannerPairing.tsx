import { usePosSession } from "@/hooks/usePosSession"
import { useScanSocket } from "@/hooks/useScanSocket"
import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

export function ScannerPairing() {
  const { sessionCode, createSession, loading } = usePosSession()
  useScanSocket(sessionCode)

  useEffect(() => {
    createSession()
  }, [])
console.log("sessionCode:", sessionCode);
  // Deep link the phone opens directly to scanner page
  const pairingUrl = sessionCode
    ? `${window.location.origin}/scan?session=${sessionCode}`
    : null
  if (loading)
    return <p className="text-sm text-gray-500">Generating session...</p>
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
      <p className="text-sm font-medium text-gray-700">
        Scan to pair phone scanner
      </p>
      {pairingUrl && <QRCodeSVG value={pairingUrl} size={160} />}
      <p className="font-mono text-xs text-gray-400">{sessionCode}</p>
      <button
        onClick={createSession}
        className="text-xs text-blue-500 underline"
      >
        Regenerate
      </button>
    </div>
  )
}
