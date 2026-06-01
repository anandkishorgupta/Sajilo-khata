import type { Product } from "@/api/inventory"
import { deleteProduct } from "@/api/inventory"
import AddProductSheet from "@/components/inventory/ProductSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"
import { useInventoryStats, useProducts } from "@/query/useInventory"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, MoreHorizontal, Plus, Search } from "lucide-react"
import { useState } from "react"

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [stockFilter, setStockFilter] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const { data: stats, isLoading: statsLoading } = useInventoryStats()
  const { data: products, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    category,
    stockFilter,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] })
    },
    onError: (error) => {
      console.error("Failed to delete product:", error)
      alert("Failed to delete product. Please try again.")
    },
  })

  // The only fix: id type is now number, so remove any string casting
  const handleDelete = (id: number) => {
    // ✅ was (id: string)
    const ok = window.confirm(
      "Delete this product? This action cannot be undone."
    )
    if (!ok) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="flex flex-col gap-1 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {statsLoading
              ? "Loading…"
              : `${stats?.total ?? 0} products · Rs ${stats?.stockValue?.toLocaleString() ?? 0} stock value`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-primary shadow-glow gap-1.5 text-primary-foreground"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="mb-3 h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          : [
              { l: "Total products", v: stats?.total ?? 0, tone: null },
              { l: "Low stock", v: stats?.lowStock ?? 0, tone: "danger" },
              { l: "Categories", v: stats?.categories ?? 0, tone: null },
            ].map((s) => (
              <Card key={s.l}>
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="font-display text-2xl font-bold">{s.v}</div>
                    {s.tone && (
                      <Badge
                        variant={
                          s.tone === "danger" ? "destructive" : "outline"
                        }
                        className={
                          s.tone === "warning"
                            ? "border-warning text-warning"
                            : ""
                        }
                      >
                        review
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Table card */}
      <Card className="mt-5">
        <CardContent className="p-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search products, SKU, barcode…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          {/* Table */}
          <div className="-mx-5 mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 text-right font-medium">Buy</th>
                  <th className="px-3 py-3 text-right font-medium">Sell</th>
                  <th className="px-3 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products?.map((p) => {
                    const low = p.stock <= p.lowStockLimit
                    return (
                      <tr
                        key={p.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-primary/10">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  📦
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Margin{" "}
                                {Math.round(
                                  ((p.sellingPrice - p.purchasePrice) /
                                    p.sellingPrice) *
                                    100
                                )}
                                %
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                          {p.sku}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="outline">{p.category}</Badge>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          Rs {p.purchasePrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          Rs {p.sellingPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {low && (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            )}
                            <span
                              className={`tabular-nums ${low ? "font-semibold text-destructive" : ""}`}
                            >
                              {p.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProduct(p)
                                  setEditOpen(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleDelete(p.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <AddProductSheet
        open={addOpen || editOpen}
        onClose={() => {
          setAddOpen(false)
          setEditOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
    </div>
  )
}
