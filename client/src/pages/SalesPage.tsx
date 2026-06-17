import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SaleDetailSheet } from "@/components/sales/SaleDetailSheet"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDate, formatNPR, formatTime } from "@/lib/format"
import { useDeleteSale, useSales, useSalesSummary } from "@/query/useSales"
import type {
  DateRangeFilter,
  PaymentMethod,
  PaymentStatus,
  SalesFilters,
} from "@/types/sale"
import { Eye, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RANGE_TABS: { label: string; value: DateRangeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
]

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  qr: "QR",
  bank: "Bank",
  credit: "Udhaaro",
  mixed: "Partial",
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  due: "Due",
}

const STATUS_BADGE_VARIANT: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700 hover:bg-green-100",
  partial: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  due: "bg-red-100 text-red-700 hover:bg-red-100",
}

export default function SalesPage() {
  const navigate = useNavigate()

  const [range, setRange] = useState<DateRangeFilter>("today")
  const [searchInput, setSearchInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  )
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">(
    "all"
  )
  const [page, setPage] = useState(1)
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null)

  const debouncedSearch = useDebounce(searchInput, 400)

  const filters: SalesFilters = {
    range,
    search: debouncedSearch || undefined,
    paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
    paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
    page,
    limit: 20,
  }

  const { data: salesData, isLoading, isFetching } = useSales(filters)
  const { data: summary } = useSalesSummary(filters)
  const deleteMutation = useDeleteSale()
  const handleRangeChange = (value: DateRangeFilter) => {
    setRange(value)
    setPage(1)
  }

  const handleConfirmDelete = () => {
    if (saleToDelete !== null) {
      deleteMutation.mutate(saleToDelete)
      setSaleToDelete(null)
    }
  }
  const sales = salesData?.data ?? []
  const totalPages = salesData?.meta?.totalPages ?? 1

  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const handleViewSale = (id: number) => {
    setSelectedSaleId(id)
    setDetailOpen(true)
  }
  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sales</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all sales records
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/billing")}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Kul Bikri</p>
          <p className="mt-1 text-2xl font-semibold">
            {summary ? formatNPR(summary.totalSales) : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Kul Bill</p>
          <p className="mt-1 text-2xl font-semibold">
            {summary ? summary.totalBills : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Baki (Udhaaro)</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {summary ? formatNPR(summary.totalDue) : "—"}
          </p>
          {summary && summary.dueBillsCount > 0 && (
            <p className="mt-1 text-xs text-red-500">
              {summary.dueBillsCount} unpaid bills
            </p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Prapt Bhayeko</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {summary ? formatNPR(summary.cashReceived) : "—"}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md bg-muted p-1">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleRangeChange(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                range === tab.value
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number or customer..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <Select
          value={paymentMethod}
          onValueChange={(v) => {
            setPaymentMethod(v as PaymentMethod | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="qr">QR</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="credit">Credit (Udhaaro) </SelectItem>
            <SelectItem value="mixed">Partial</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus}
          onValueChange={(v) => {
            setPaymentStatus(v as PaymentStatus | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="due">Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Sales Records</span>
          <span className="text-xs text-muted-foreground">
            {salesData ? `${salesData.meta.total} bills` : ""}
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No.</TableHead>
              <TableHead>Samay</TableHead>
              <TableHead>Grahak</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead>Rakam</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(sale.createdAt)}
                  </TableCell>
                  <TableCell>
                    {sale.customer ? (
                      <>
                        <div className="font-medium">{sale.customer.name}</div>
                        {sale.customer.phone && (
                          <div className="text-xs text-muted-foreground">
                            {sale.customer.phone}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Walk-in Customer
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {sale.items?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatNPR(sale.totalAmount)}
                    </div>
                    {Number(sale.dueAmount) > 0 && (
                      <div className="text-xs text-red-500">
                        {formatNPR(sale.dueAmount)} due
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE_VARIANT[sale.paymentStatus]}>
                      {PAYMENT_STATUS_LABELS[sale.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewSale(sale.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSaleToDelete(sale.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {salesData && totalPages > 1 && (
          <Pagination className="py-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setPage(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog
        open={saleToDelete !== null}
        onOpenChange={(open) => !open && setSaleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this sale will automatically restore the stock. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SaleDetailSheet
        saleId={selectedSaleId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
