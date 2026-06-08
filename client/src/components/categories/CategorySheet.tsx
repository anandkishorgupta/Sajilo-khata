import { useState, useEffect } from "react"
import type { Category } from "@/api/categories"
import { createCategory, updateCategory } from "@/api/categories"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import toast from "react-hot-toast"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSaved: () => void
}

export function CategorySheet({ open, onOpenChange, category, onSaved }: Props) {
  const isEdit = !!category
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description ?? "",
      })
    } else {
      setForm({ name: "", description: "" })
    }
  }, [category, open])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      }
      if (isEdit) {
        await updateCategory(category.id, payload)
        toast.success("Category updated")
      } else {
        await createCategory(payload)
        toast.success("Category created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save category"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Category" : "New Category"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update category information."
              : "Add a new category to your shop."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Category name"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description (optional)"
            />
          </div>

          <Button className="w-full" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving..." : isEdit ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
