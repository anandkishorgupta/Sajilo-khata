import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatNPR, formatTime } from "@/lib/format"
import { useSaleDetail } from "@/query/use-sale-detail"
import type { PaymentMethod, PaymentStatus } from "@/types/sale"
import { MapPin, Phone, Receipt, User } from "lucide-react"

interface SaleDetailSheetProps {
  saleId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  qr: "QR / Digital",
  bank: "Bank Transfer",
  credit: "Udhaaro (Credit)",
  mixed: "Partial Payment",
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  due: "Due",
}

const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700 hover:bg-green-100",
  partial: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  due: "bg-red-100 text-red-700 hover:bg-red-100",
}

export function SaleDetailSheet({
  saleId,
  open,
  onOpenChange,
}: SaleDetailSheetProps) {
  let { data: sale, isLoading, isError } = useSaleDetail(saleId)
  sale = sale?.data
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {sale ? sale.invoiceNumber : "Bill Detail"}
          </SheetTitle>
          <SheetDescription>
            {sale
              ? `${formatDate(sale.createdAt)} · ${formatTime(sale.createdAt)}`
              : "Bikri ko pura detail"}
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
            Sale detail load garna sakiyena. Pheri try garnu hos.
          </div>
        )}

        {sale && (
          <div className="mt-6 space-y-6">
            {/* STATUS + METHOD */}
            <div className="flex items-center justify-between">
              <Badge className={STATUS_BADGE_CLASS[sale.paymentStatus]}>
                {PAYMENT_STATUS_LABELS[sale.paymentStatus]}
              </Badge>
              <Badge variant="outline">
                {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
              </Badge>
            </div>

            {/* CUSTOMER INFO */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Grahak
              </h3>
              {sale.customer ? (
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {sale.customer.name}
                  </div>
                  {sale.customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {sale.customer.phone}
                    </div>
                  )}
                  {sale.customer.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {sale.customer.address}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground italic">
                  Walk-in grahak (no record)
                </div>
              )}
            </div>

            <Separator />

            {/* ITEMS */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Items ({sale.items?.length ?? 0})
              </h3>
              <div className="space-y-2">
                {sale.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {item.product?.name ?? "Unknown product"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} × {formatNPR(item.unitPrice)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatNPR(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* AMOUNT BREAKDOWN */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNPR(sale.subtotal)}</span>
              </div>

              {Number(sale.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500">
                    − {formatNPR(sale.discount)}
                  </span>
                </div>
              )}

              {Number(sale.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>+ {formatNPR(sale.tax)}</span>
                </div>
              )}

              <Separator className="my-1" />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatNPR(sale.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-600">
                  {formatNPR(sale.paidAmount)}
                </span>
              </div>

              {Number(sale.dueAmount) > 0 && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-red-500">Baki (Due)</span>
                  <span className="text-red-500">
                    {formatNPR(sale.dueAmount)}
                  </span>
                </div>
              )}
            </div>

            {sale.note && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                    Note
                  </h3>
                  <p className="text-sm">{sale.note}</p>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
