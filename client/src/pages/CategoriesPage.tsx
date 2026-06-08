import type { Category } from "@/api/categories"
import { deleteCategory } from "@/api/categories"
import { CategorySheet } from "@/components/categories/CategorySheet"
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
import { useCategories } from "@/query/useCategories"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FolderOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading: loading } = useCategories()
  const [search, setSearch] = useState("")

  const [addOpen, setAddOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] })
    queryClient.invalidateQueries({ queryKey: ["inventory-stats"] })
  }

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted")
      invalidateCategories()
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: () => {
      toast.error("Failed to delete category")
    },
  })

  const handleDelete = (id: number) => {
    const ok = window.confirm("Delete this category? This cannot be undone.")
    if (!ok) return
    deleteMutation.mutate(id)
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories for your shop
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : categories.length}
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
              placeholder="Search by name or description..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                {search ? "No categories match your search" : "No categories yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditCategory(c)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheets */}
      <CategorySheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={invalidateCategories}
      />

      <CategorySheet
        open={editOpen}
        onOpenChange={setEditOpen}
        category={editCategory}
        onSaved={invalidateCategories}
      />
    </div>
  )
}
