// src/pages/ScannerPage.tsx
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { io, Socket } from "socket.io-client"

// Ambient typing in case your TS lib.dom doesn't yet ship BarcodeDetector types
declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

// ─── Types ───────────────────────────────────────────────────────
type ConfirmedResult = {
  status: "confirmed"
  barcode: string
  product: { id: number; name: string; price: number }
  quantity: number
  cartTotal: number
}
type ErrorResult = {
  status: "error"
  message: string
  barcode?: string
}
type DuplicateResult = {
  status: "duplicate"
  barcode: string
  message: string
}
type ScanResult = ConfirmedResult | ErrorResult | DuplicateResult | null
type CameraState = "idle" | "requesting" | "active" | "denied" | "error"
type ScanMode = "detecting" | "native" | "quagga"

const BARCODE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "qr_code",
]
const QUAGGA_READERS = [
  "ean_reader",
  "ean_8_reader",
  "upc_reader",
  "upc_e_reader",
  "code_128_reader",
]

// ─── Audio ───────────────────────────────────────────────────────
function playBeep(success = true) {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = success ? 1046 : 330
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

function playDuplicateBeep() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 660
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

// ─── EAN/UPC checksum validator (guards the Quagga2 fallback path) ─
function isValidChecksum(code: string): boolean {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$/.test(code)) return true
  const digits = code.split("").map(Number)
  const checkDigit = digits[digits.length - 1]
  const payload = digits.slice(0, -1)
  let sum = 0
  let weight = 3
  for (let i = payload.length - 1; i >= 0; i--) {
    sum += payload[i] * weight
    weight = weight === 3 ? 1 : 3
  }
  const calculated = (10 - (sum % 10)) % 10
  return calculated === checkDigit
}

// ─── Animated check ──────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 inline-block h-6 w-6">
      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
        .c { stroke-dasharray: 66; stroke-dashoffset: 66; animation: drawCircle 0.4s ease forwards; }
        .k { stroke-dasharray: 22; stroke-dashoffset: 22; animation: drawCheck 0.3s ease 0.35s forwards; }
      `}</style>
      <circle
        className="c"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        className="k"
        d="M7 12l4 4 6-7"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mr-2 inline-block h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ScannerPage() {
  const [params] = useSearchParams()
  const sessionCode = params.get("session") ?? ""

  const socketRef = useRef<Socket | null>(null)

  // ── Camera / detector state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const quaggaRef = useRef<any>(null)
  const [scanMode, setScanMode] = useState<ScanMode>("detecting")
  const [isScanning, setIsScanning] = useState(false)

  const [result, setResult] = useState<ScanResult>(null)
  const [laptopOnline, setLaptopOnline] = useState(false)

  const [cameraState, setCameraState] = useState<CameraState>("idle")
  const [cameraError, setCameraError] = useState<string>("")
  const [scannedCount, setScannedCount] = useState(0)

  const resultTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // ── Prevents a second tap from firing a new scan while we're still
  // waiting on the server's response to the previous one
  const waitingForResponseRef = useRef(false)

  const showResult = useCallback((r: ScanResult, duration = 3000) => {
    setResult(r)
    clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => setResult(null), duration)
  }, [])

  // ── Clear any pending result timer on unmount to avoid setting state
  // on an unmounted component
  useEffect(() => {
    return () => {
      clearTimeout(resultTimerRef.current)
    }
  }, [])

  // ── Sends a scan to the server
  const emitScan = useCallback(
    (barcode: string) => {
      socketRef.current?.emit("scan:product", {
        barcode,
        sessionCode,
      })
    },
    [sessionCode]
  )

  const sendScan = useCallback(
    (barcode: string) => {
      if (!socketRef.current?.connected) {
        navigator.vibrate?.([50, 30, 50])
        showResult(
          {
            status: "error",
            message: "Laptop is disconnected",
          },
          2000
        )
        return
      }

      if (waitingForResponseRef.current) return

      waitingForResponseRef.current = true
      emitScan(barcode)

      setTimeout(() => {
        waitingForResponseRef.current = false
      }, 8000)
    },
    [emitScan, showResult]
  )

  // ── Shared entry point for a decoded code, regardless of which engine produced it.
  // Duplicate detection is NOT done here — the laptop owns the cart and is the
  // single source of truth, so every valid code is sent through and the
  // laptop tells us via "scan:duplicate" / "scan:confirmed" what happened.
  const handleDecodedCode = useCallback(
    (rawCode: string, source: "native" | "quagga") => {
      const code = rawCode.trim()
      if (!code) {
        showResult(
          { status: "error", message: "No barcode detected — try again" },
          1800
        )
        return
      }

      if (source === "quagga" && !isValidChecksum(code)) {
        showResult(
          { status: "error", message: "Unclear read — try again" },
          1800
        )
        return
      }

      sendScan(code)
    },
    [sendScan, showResult]
  )

  // ─── Socket setup ────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionCode) return

    const socket = io(`${import.meta.env.VITE_API_URL}/scan`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("scan:join", { sessionCode })
    })

    socket.on(
      "scan:joined",
      (data: {
        sessionCode: string
        shopId: number
        laptopOnline: boolean
      }) => {
        setLaptopOnline(data.laptopOnline)
      }
    )
    socket.on("scan:laptop-online", () => setLaptopOnline(true))
    socket.on("scan:laptop-disconnected", () => setLaptopOnline(false))
    socket.on("disconnect", () => {
      waitingForResponseRef.current = false
    })

    socket.on("scan:confirmed", (data: ConfirmedResult) => {
      waitingForResponseRef.current = false
      setScannedCount((c) => c + 1)

      playBeep(true)
      navigator.vibrate?.(80)
      showResult({ ...data, status: "confirmed" })
    })

    socket.on("scan:duplicate", (data: DuplicateResult) => {
      waitingForResponseRef.current = false
      playDuplicateBeep()
      navigator.vibrate?.([50, 30, 50])
      showResult({ ...data, status: "duplicate" }, 2000)
    })

    socket.on("scan:error", (data: { message: string; barcode?: string }) => {
      waitingForResponseRef.current = false
      playBeep(false)
      navigator.vibrate?.([100, 50, 100])
      showResult({ status: "error", ...data }, 2500)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [sessionCode, showResult])

  // ─── Camera bootstrap: just starts a live preview, no decoding yet ─
  const startCamera = useCallback(async () => {
    setCameraState("requesting")
    setCameraError("")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Prefer native BarcodeDetector if the device actually supports the formats we need
      if ("BarcodeDetector" in window) {
        try {
          const supported: string[] = await (
            window as any
          ).BarcodeDetector.getSupportedFormats()
          const usableFormats = BARCODE_FORMATS.filter((f) =>
            supported.includes(f)
          )
          if (usableFormats.length > 0) {
            detectorRef.current = new (window as any).BarcodeDetector({
              formats: usableFormats,
            })
            setScanMode("native")
            setCameraState("active")
            return
          }
        } catch (err) {
          console.warn(
            "Native BarcodeDetector unavailable, falling back to Quagga2:",
            err
          )
        }
      }

      // Fallback: Quagga2, used only for single-frame decodeSingle() on tap —
      // no live decode loop is started, so it's cheap to keep loaded.
      const Quagga = (await import("@ericblade/quagga2")).default
      quaggaRef.current = Quagga
      setScanMode("quagga")
      setCameraState("active")
    } catch (err: any) {
      console.error("Camera failed to start:", err)
      const name = err?.name || "Error"
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraState("denied")
        setCameraError(
          "Camera permission was denied. Enable it in your browser's site settings and reload."
        )
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraState("error")
        setCameraError("No camera device found on this phone.")
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraState("error")
        setCameraError(
          "Camera is already in use by another app or browser tab. Close it and retry."
        )
      } else {
        setCameraState("error")
        setCameraError(err?.message || "Unknown camera error.")
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    detectorRef.current = null
    quaggaRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const handleRetry = () => {
    stopCamera()
    startCamera()
  }

  // ── Captures the current video frame to the hidden canvas as a JPEG data URL
  const captureFrameDataUrl = (): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.videoWidth === 0) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.92)
  }

  // ── Runs ONE decode attempt on the current frame. This is the only
  // place decoding happens now — everything else is just camera preview.
  async function handleManualScan() {
    if (isScanning || cameraState !== "active") return
    setIsScanning(true)

    try {
      if (scanMode === "native" && detectorRef.current && videoRef.current) {
        const codes = await detectorRef.current.detect(videoRef.current)
        if (codes.length > 0) {
          handleDecodedCode(codes[0].rawValue, "native")
        } else {
          showResult(
            {
              status: "error",
              message: "No barcode detected — align and try again",
            },
            1800
          )
        }
      } else if (scanMode === "quagga" && quaggaRef.current) {
        const dataUrl = captureFrameDataUrl()
        if (!dataUrl) throw new Error("Could not capture frame")

        const code = await new Promise<string | null>((resolve) => {
          quaggaRef.current.decodeSingle(
            {
              src: dataUrl,
              numOfWorkers: 0,
              locate: true,
              inputStream: { size: 800 },
              decoder: { readers: QUAGGA_READERS },
            },
            (result: any) => resolve(result?.codeResult?.code ?? null)
          )
        })

        if (code) {
          handleDecodedCode(code, "quagga")
        } else {
          showResult(
            {
              status: "error",
              message: "No barcode detected — align and try again",
            },
            1800
          )
        }
      }
    } catch (err) {
      console.error("Manual scan failed:", err)
      showResult({ status: "error", message: "Scan failed — try again" }, 1800)
    } finally {
      setIsScanning(false)
    }
  }

  // ─── Reset for new customer / billing complete ────────────────────
  function handleResetSession() {
    setScannedCount(0)
    setResult(null)
    // Requires a corresponding @SubscribeMessage('scan:reset-session') on the
    // gateway that clears the server-side cart state for this sessionCode.
    socketRef.current?.emit("scan:reset-session", { sessionCode })
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white select-none">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
        <span className="font-mono text-xs text-gray-400">{sessionCode}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{scannedCount} items</span>

          <span
            className={`h-2 w-2 rounded-full ${laptopOnline ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-xs text-gray-400">
            {laptopOnline ? "Laptop connected" : "Laptop offline"}
          </span>
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {cameraState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm text-gray-300">Requesting camera access…</p>
          </div>
        )}

        {(cameraState === "denied" || cameraState === "error") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 px-6 text-center">
            <p className="text-base font-medium text-red-400">
              Camera unavailable
            </p>
            <p className="text-sm text-gray-300">{cameraError}</p>
            <button
              onClick={handleRetry}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white active:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {cameraState === "active" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-64 w-64">
              {["tl", "tr", "bl", "br"].map((corner) => (
                <div
                  key={corner}
                  className={`absolute h-8 w-8 border-2 ${isScanning ? "border-blue-400" : "border-white"} ${
                    corner === "tl"
                      ? "top-0 left-0 rounded-tl-lg border-r-0 border-b-0"
                      : corner === "tr"
                        ? "top-0 right-0 rounded-tr-lg border-b-0 border-l-0"
                        : corner === "bl"
                          ? "bottom-0 left-0 rounded-bl-lg border-t-0 border-r-0"
                          : "right-0 bottom-0 rounded-br-lg border-t-0 border-l-0"
                  }`}
                />
              ))}
              {isScanning && (
                <>
                  <div
                    className="absolute right-1 left-1 h-0.5 bg-blue-400"
                    style={{ animation: "scanLine 0.6s ease-in-out infinite" }}
                  />
                  <style>{`
                    @keyframes scanLine {
                      0%, 100% { top: 8px; }
                      50% { top: calc(100% - 8px); }
                    }
                  `}</style>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div
          className={`mx-3 mb-2 rounded-2xl p-4 transition-all duration-300 ${
            result.status === "confirmed"
              ? "bg-green-600"
              : result.status === "duplicate"
                ? "bg-amber-600"
                : "bg-red-600"
          }`}
        >
          {result.status === "confirmed" && (
            <>
              <div className="flex items-center text-base font-semibold">
                <AnimatedCheck />
                {result.product.name}
              </div>
              <div className="mt-1 flex justify-between text-sm opacity-80">
                <span>Qty: {result.quantity}</span>
                <span>Rs. {result.product.price}</span>
              </div>
              <div className="mt-0.5 text-xs opacity-60">
                Cart total: Rs. {result.cartTotal}
              </div>
            </>
          )}

          {result.status === "duplicate" && (
            <>
              <div className="text-base font-semibold">⚠ {result.message}</div>
              <div className="mt-1 font-mono text-xs opacity-70">
                {result.barcode}
              </div>
            </>
          )}

          {result.status === "error" && (
            <>
              <div className="text-base font-semibold">✗ {result.message}</div>
              {result.barcode && (
                <div className="mt-1 font-mono text-xs opacity-60">
                  {result.barcode}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Scan trigger + complete billing */}
      <div className="space-y-2 px-4 pb-4">
        <button
          onClick={handleManualScan}
          disabled={
            cameraState !== "active" ||
            isScanning ||
            waitingForResponseRef.current
          }
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-40"
        >
          {isScanning ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Scanning...
            </>
          ) : waitingForResponseRef.current ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Adding...
            </>
          ) : (
            <>
              <ScanIcon />
              Tap to Scan
            </>
          )}
        </button>

        <button
          onClick={handleResetSession}
          disabled={scannedCount === 0}
          className="w-full rounded-xl bg-gray-800 py-3 text-sm font-medium text-gray-200 active:bg-gray-700 disabled:opacity-40"
        >
          ✓ Complete billing / New customer
        </button>
      </div>
    </div>
  )
}
