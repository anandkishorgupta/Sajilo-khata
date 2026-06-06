import { AppShell } from "@/components/billing/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Search, User, X } from "lucide-react"
import { useState } from "react"

import type { RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"

import { useDebounce } from "@/hooks/useDebounce"
import { useProducts } from "@/query/useInventory"

import {
  addItem,
  clearCart,
  decreaseQty,
  increaseQty,
  removeItem,
} from "@/store/slices/cartSlice"

import { createSale } from "@/api/billing"

import { BillingSummary } from "@/components/billing/BillingSummary"
import { CartItem } from "@/components/billing/CartItem"
import { CustomerSelect } from "@/components/billing/CustomerSelect"
import { PaymentPanel } from "@/components/billing/PaymentPanel"
import { ProductGrid } from "@/components/billing/ProductGrid"
import { SaleSuccessSheet } from "@/components/billing/SaleSuccessSheet"

import toast from "react-hot-toast"

type Customer = { id: number; name: string; phone: string; address?: string }
type CompletedSale = {
  id: number
  invoiceNumber: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
}

export default function BillingPage() {
  const dispatch = useDispatch()
  const cart = useSelector((state: RootState) => state.cart.items)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)

  const [method, setMethod] = useState<"qr" | "cash" | "credit">("cash")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [loading, setLoading] = useState(false)

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false)

  // Sale success
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const { data } = useProducts({
    search: debouncedSearch,
  })

  const products = data?.products ?? data ?? []

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal - discount + tax

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    if (method === "credit" && !customer) {
      toast.error("Please select a customer for Khata sales")
      setCustomerSheetOpen(true)
      return
    }

    setLoading(true)
    try {
      const res = await createSale({
        items: cart.map((item) => ({
          productId: Number(item.id),
          quantity: item.qty,
          unitPrice: item.price,
        })),
        paymentMethod: method,
        discount: discount || undefined,
        tax: tax || undefined,
        paidAmount: method === "credit" ? 0 : total,
        customerId: customer?.id,
      })
      const sale = res.data?.data ?? res.data
      setCompletedSale(sale)
      setSuccessOpen(true)
      dispatch(clearCart())
      setDiscount(0)
      setTax(0)
      setCustomer(null)
      toast.success("Sale completed!")
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to complete sale"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setSuccessOpen(false)
    setCompletedSale(null)
  }

  return (
    <AppShell title="New Sale" subtitle="POS Billing System">
      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        {/* Product search & grid */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>

            <ProductGrid
              products={products}
              onAdd={(p) =>
                dispatch(
                  addItem({
                    id: p.id,
                    name: p.name,
                    price: p.sellingPrice,
                    img: p.imageUrl,
                  })
                )
              }
            />
          </CardContent>
        </Card>

        {/* Cart & payment sidebar */}
        <div className="space-y-4">
          {/* Customer selection */}
          <Card>
            <CardContent className="p-4">
              {customer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomerSheetOpen(true)}
                    >
                      Change
                    </Button>
                    <button onClick={() => setCustomer(null)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCustomerSheetOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Select Customer (Optional)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Cart items */}
          <Card>
            <CardHeader title="Cart" subtitle={`${cart.length} items`} />

            <CardContent className="space-y-2">
              {cart.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Cart is empty
                </p>
              )}

              {cart.map((i) => (
                <CartItem
                  key={i.id}
                  item={i}
                  onIncrease={() => dispatch(increaseQty(i.id))}
                  onDecrease={() => dispatch(decreaseQty(i.id))}
                  onRemove={() => dispatch(removeItem(i.id))}
                />
              ))}
            </CardContent>

            <CardContent className="border-t p-4">
              <BillingSummary
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
                onDiscountChange={setDiscount}
                onTaxChange={setTax}
              />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader title="Payment Method" />

            <CardContent>
              <PaymentPanel
                method={method}
                total={total}
                loading={loading}
                disabled={cart.length === 0}
                onMethodChange={setMethod}
                onCompleteSale={handleCompleteSale}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sheets */}
      <CustomerSelect
        open={customerSheetOpen}
        onOpenChange={setCustomerSheetOpen}
        selected={customer}
        onSelect={setCustomer}
      />

      <SaleSuccessSheet
        open={successOpen}
        onClose={handleSuccessClose}
        sale={completedSale}
      />
    </AppShell>
  )
}
