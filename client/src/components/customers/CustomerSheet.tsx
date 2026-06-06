import { useState, useEffect } from "react"
import type { Customer } from "@/api/customers"
import { createCustomer, updateCustomer } from "@/api/customers"
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
  customer?: Customer | null
  onSaved: () => void
}

export function CustomerSheet({ open, onOpenChange, customer, onSaved }: Props) {
  const isEdit = !!customer
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", address: "" })

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone ?? "",
        address: customer.address ?? "",
      })
    } else {
      setForm({ name: "", phone: "", address: "" })
    }
  }, [customer, open])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
      }
      if (isEdit) {
        await updateCustomer(customer.id, payload)
        toast.success("Customer updated")
      } else {
        await createCustomer(payload)
        toast.success("Customer created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save customer"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Customer" : "New Customer"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update customer information."
              : "Add a new customer to your shop."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Address (optional)"
            />
          </div>

          <Button className="w-full" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving..." : isEdit ? "Update Customer" : "Add Customer"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
