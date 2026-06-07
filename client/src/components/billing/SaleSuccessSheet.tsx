import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { downloadInvoice, downloadThermalReceipt } from "@/api/billing"
import { CheckCircle2, FileText, Printer } from "lucide-react"
import toast from "react-hot-toast"
import { useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
  sale: {
    id: number
    invoiceNumber: string
    totalAmount: number
    paymentMethod: string
    paymentStatus: string
  } | null
}

export function SaleSuccessSheet({ open, onClose, sale }: Props) {
  console.log("Rendering SaleSuccessSheet with sale:", sale)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (type: "pdf" | "thermal") => {
    if (!sale) return
     console.log("Downloading for saleId:", sale.id) // add this
    setDownloading(true)
    try {
      const res =
        type === "pdf"
          ? await downloadInvoice(sale.id)
          : await downloadThermalReceipt(sale.id)

      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${sale.invoiceNumber}-${type}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to download invoice")
    } finally {
      setDownloading(false)
    }
  }

  if (!sale) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sale Complete</SheetTitle>
          <SheetDescription>Your sale has been recorded.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-1">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-2xl font-bold">Rs {Number(sale.totalAmount).toFixed(2)}</p>
          </div>

          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice</span>
              <span className="font-medium">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium capitalize">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{sale.paymentStatus}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={downloading}
              onClick={() => handleDownload("pdf")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Invoice (A4)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={downloading}
              onClick={() => handleDownload("thermal")}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt (Thermal)
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              New Sale
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
