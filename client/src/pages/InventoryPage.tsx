import type { Product } from "@/api/inventory"
import { deleteProduct } from "@/api/inventory"
import AddProductSheet from "@/components/inventory/ProductSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebounce } from "@/hooks/useDebounce"
import { useInventoryStats, useProducts } from "@/query/useInventory"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 10
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [stockFilter, setStockFilter] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")

  const [addOpen, setAddOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const { data: stats, isLoading: statsLoading } = useInventoryStats()
  const { data, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    category,
    stockFilter,
    sortBy,
    sortOrder,
    page,
    limit,
  })

  const products = data?.products ?? []
  const meta = data?.meta

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] })
      toast.success("Product deleted!")
    },
    onError: (error) => {
      const message = "Failed to delete product"
      toast.error(message)
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

  // Add this function inside InventoryPage
  const resetFilters = () => {
    setSearch("")
    setCategory("")
    setStockFilter("")
    setSortBy("createdAt")
    setSortOrder("DESC")
    setPage(1)
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
            Search
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search products"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            Category
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All categories</option>
              <option value="Drinks">Drinks</option>
              <option value="Snacks">Snacks</option>
              {/* add your categories dynamically if you have a /categories endpoint */}
            </select>
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
            {/* Sort By */}
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
            >
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="stock">Stock</option>
              <option value="purchasePrice">Purchase Price</option>
              <option value="sellingPrice">Selling Price</option>
            </select>
            {/* Sort Order */}
            <div className="flex items-center gap-2">
              {sortOrder === "ASC" ? <FaSortAlphaUp /> : <FaSortAlphaDown />}

              <select
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as "ASC" | "DESC")
                  setPage(1)
                }}
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="-mx-5 mt-4 overflow-x-auto">
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Buy</TableHead>
                    <TableHead className="text-right">Sell</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {productsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => {
                      const low = p.stock <= p.lowStockLimit

                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    📦
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Margin{" "}
                                  {Math.round(
                                    ((p.sellingPrice - p.purchasePrice) /
                                      p.sellingPrice) *
                                      100
                                  )}
                                  %
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-mono">
                            {p.barcode}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">{p.category}</Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            Rs {p.purchasePrice.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            Rs {p.sellingPrice.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {low && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span
                                className={
                                  low ? "font-semibold text-destructive" : ""
                                }
                              >
                                {p.stock}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedProduct(p)
                                  setEditOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: meta.totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        page < meta.totalPages && setPage(page + 1)
                      }
                      className={
                        page === meta.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
        onSuccess={() => {
          // ADD THIS
          if (!selectedProduct) {
            // only reset on ADD, not edit
            resetFilters()
          }
        }}
      />
    </div>
  )
}
