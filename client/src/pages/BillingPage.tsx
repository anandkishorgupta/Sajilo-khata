import { AppShell } from "@/components/billing/app-shell"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Search } from "lucide-react"
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

import { BillingSummary } from "@/components/billing/BillingSummary"
import { CartItem } from "@/components/billing/CartItem"
import { PaymentPanel } from "@/components/billing/PaymentPanel"
import { ProductGrid } from "@/components/billing/ProductGrid"

export default function BillingPage() {
  const dispatch = useDispatch()
  const cart = useSelector((state: RootState) => state.cart.items)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)

  const [method, setMethod] = useState<"qr" | "cash" | "credit">("qr")

  const { data } = useProducts({
    search: debouncedSearch,
  })

  const products = data?.products ?? data ?? []

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const discount = 0
  const total = subtotal - discount

  return (
    <AppShell title="New Sale" subtitle="POS Billing System">
      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
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

        <div className="space-y-4">
          <Card>
            <CardHeader title="Cart" subtitle={`${cart.length} items`} />

            <CardContent className="space-y-2">
              <p>Current Items:</p>
              <p>{cart.length} items</p>
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
                total={total}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Payment Method" />

            <CardContent>
              <PaymentPanel
                method={method}
                total={total}
                onMethodChange={setMethod}
                onCompleteSale={() => dispatch(clearCart())}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
