import { useState, useEffect } from "react"
import { getCustomers, createCustomer } from "@/api/billing"
import { useDebounce } from "@/hooks/useDebounce"
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
import { Search, UserPlus, X, User } from "lucide-react"
import toast from "react-hot-toast"

type Customer = {
  id: number
  name: string
  phone: string
  address?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: Customer | null
  onSelect: (customer: Customer | null) => void
}

export function CustomerSelect({ open, onOpenChange, selected, onSelect }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", address: "" })

  useEffect(() => {
    if (!open) return

    setLoading(true)
    getCustomers(debouncedSearch || undefined)
      .then((res) => setCustomers(res.data?.data ?? res.data ?? []))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false))
  }, [open, debouncedSearch])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required")
      return
    }
    setCreating(true)
    try {
      const res = await createCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
      })
      const newCustomer = res.data?.data ?? res.data
      setCustomers((prev) => [newCustomer, ...prev])
      onSelect(newCustomer)
      setForm({ name: "", phone: "", address: "" })
      setShowCreate(false)
      onOpenChange(false)
      toast.success("Customer created")
    } catch {
      toast.error("Failed to create customer")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Customer</SheetTitle>
          <SheetDescription>
            Choose an existing customer or create a new one for this sale.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 px-1">
          {selected && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.phone}</p>
                </div>
              </div>
              <button onClick={() => onSelect(null)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Searching...
              </p>
            ) : customers.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c)
                  onOpenChange(false)
                }}
                className={`w-full rounded-lg p-3 text-left transition hover:bg-muted ${
                  selected?.id === c.id ? "bg-primary/5 ring-1 ring-primary/30" : ""
                }`}
              >
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone}</p>
              </button>
            ))}
            {!loading && customers.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No customers found
              </p>
            )}
          </div>

          {!showCreate ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreate(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">New Customer</p>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={creating}
                  onClick={handleCreate}
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
