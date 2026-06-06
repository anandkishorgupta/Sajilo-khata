import { useState, useEffect } from "react"
import type { Customer, KhataTransaction, CustomerBalance } from "@/api/customers"
import {
  getCustomer,
  getCustomerLedger,
  getCustomerBalance,
  createKhataPayment,
} from "@/api/customers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: number | null
}

export function CustomerDetailSheet({ open, onOpenChange, customerId }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [ledger, setLedger] = useState<KhataTransaction[]>([])
  const [balance, setBalance] = useState<CustomerBalance | null>(null)
  const [loading, setLoading] = useState(false)

  // Payment form
  const [payAmount, setPayAmount] = useState("")
  const [payNote, setPayNote] = useState("")
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (open && customerId) {
      loadData(customerId)
    }
  }, [open, customerId])

  const loadData = async (id: number) => {
    setLoading(true)
    try {
      const [custRes, ledgerRes, balRes] = await Promise.all([
        getCustomer(id),
        getCustomerLedger(id),
        getCustomerBalance(id),
      ])
      setCustomer(custRes.data?.data ?? custRes.data)
      setLedger(ledgerRes.data?.data ?? ledgerRes.data ?? [])
      setBalance(balRes.data?.data ?? balRes.data)
    } catch {
      toast.error("Failed to load customer details")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!customerId || !payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setPaying(true)
    try {
      await createKhataPayment({
        customerId,
        amount: Number(payAmount),
        note: payNote.trim() || undefined,
      })
      toast.success("Payment recorded")
      setPayAmount("")
      setPayNote("")
      loadData(customerId)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to record payment"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setPaying(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{customer?.name ?? "Customer Details"}</SheetTitle>
          <SheetDescription>
            {customer?.phone}
            {customer?.address ? ` • ${customer.address}` : ""}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-6 space-y-6 px-1">
            {/* Balance Summary */}
            {balance && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Credit</p>
                  <p className="text-lg font-bold text-red-600">
                    Rs {balance.totalCredit.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    Rs {balance.totalPayment.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-lg font-bold">
                    Rs {balance.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Record Payment */}
            {balance && balance.balance > 0 && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Record Payment</p>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={balance.balance}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={`Max Rs ${balance.balance.toFixed(2)}`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Note</Label>
                    <Input
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={paying}
                  onClick={handlePayment}
                >
                  {paying ? "Processing..." : "Record Payment"}
                </Button>
              </div>
            )}

            {/* Ledger */}
            <div>
              <p className="mb-2 text-sm font-medium">Transaction History</p>
              {ledger.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No transactions yet
                </p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledger.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {tx.type === "credit" ? (
                              <Badge variant="destructive" className="gap-1">
                                <ArrowUpCircle className="h-3 w-3" />
                                Credit
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-green-600">
                                <ArrowDownCircle className="h-3 w-3" />
                                Payment
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            Rs {Number(tx.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tx.note || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
