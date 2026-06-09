import type {
  CustomerBalance,
  KhataCustomer,
  KhataTransaction,
} from "@/api/khata"
import {
  createKhataPayment,
  getCustomerBalance,
  getCustomerLedger,
  getKhataCustomers,
} from "@/api/khata"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  IndianRupee,
  Loader2,
  Search,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function KhataPage() {
  const [customers, setCustomers] = useState<KhataCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Detail sheet
  const [selectedCustomer, setSelectedCustomer] =
    useState<KhataCustomer | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [ledger, setLedger] = useState<KhataTransaction[]>([])
  const [balance, setBalance] = useState<CustomerBalance | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Payment form
  const [payAmount, setPayAmount] = useState("")
  const [payNote, setPayNote] = useState("")
  const [paying, setPaying] = useState(false)

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await getKhataCustomers()
      setCustomers(res.data?.data ?? res.data ?? [])
    } catch {
      toast.error("Failed to load khata data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const totalDue = customers.reduce((sum, c) => sum + c.balance, 0)
  const totalCustomers = customers.length

  const openDetail = async (item: KhataCustomer) => {
    setSelectedCustomer(item)
    setDetailOpen(true)
    setDetailLoading(true)
    setPayAmount("")
    setPayNote("")
    try {
      const [ledgerRes, balRes] = await Promise.all([
        getCustomerLedger(item.customer.id),
        getCustomerBalance(item.customer.id),
      ])
      setLedger(ledgerRes.data?.data ?? ledgerRes.data ?? [])
      setBalance(balRes.data?.data ?? balRes.data)
    } catch {
      toast.error("Failed to load customer details")
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedCustomer || !payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setPaying(true)
    try {
      await createKhataPayment({
        customerId: selectedCustomer.customer.id,
        amount: Number(payAmount),
        note: payNote.trim() || undefined,
      })
      toast.success("Payment recorded")
      setPayAmount("")
      setPayNote("")
      // Refresh detail + main list
      const [ledgerRes, balRes] = await Promise.all([
        getCustomerLedger(selectedCustomer.customer.id),
        getCustomerBalance(selectedCustomer.customer.id),
      ])
      setLedger(ledgerRes.data?.data ?? ledgerRes.data ?? [])
      setBalance(balRes.data?.data ?? balRes.data)
      loadCustomers()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to record payment"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setPaying(false)
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.customer.phone && c.customer.phone.includes(search))
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Khata (Ledger)</h1>
        <p className="text-sm text-muted-foreground">
          Track customer dues, payments, and credit history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <IndianRupee className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  `Rs ${totalDue.toFixed(2)}`
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Customers with Dues
              </p>
              <p className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : totalCustomers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <IndianRupee className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Avg Due / Customer
              </p>
              <p className="text-2xl font-bold">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : totalCustomers > 0 ? (
                  `Rs ${(totalDue / totalCustomers).toFixed(2)}`
                ) : (
                  "Rs 0.00"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Due Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                {search
                  ? "No customers match your search"
                  : "No pending dues — all clear!"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Due Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  .sort((a, b) => b.balance - a.balance)
                  .map((item) => (
                    <TableRow key={item.customer.id}>
                      <TableCell className="font-medium">
                        {item.customer.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.customer.phone || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        Rs {item.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(item)}
                        >
                          <BookOpen className="mr-1 h-4 w-4" />
                          View Ledger
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="overflow-y-auto" style={{ maxWidth: "500px" }}>
          <SheetHeader>
            <SheetTitle>
              {selectedCustomer?.customer.name ?? "Customer Ledger"}
            </SheetTitle>
            <SheetDescription>
              {selectedCustomer?.customer.phone}
              {selectedCustomer?.customer.address
                ? ` • ${selectedCustomer.customer.address}`
                : ""}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-6 space-y-6 px-1">
              {/* Balance Summary */}
              {balance && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Total Credit
                    </p>
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
                    <p className="text-xs text-muted-foreground">Pending Due</p>
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

              {/* Transaction History */}
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
                          <TableHead>Note / Invoice</TableHead>
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
                              {tx.sale
                                ? `Invoice #${tx.sale.invoiceNumber}`
                                : tx.note || "-"}
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
    </div>
  )
}
