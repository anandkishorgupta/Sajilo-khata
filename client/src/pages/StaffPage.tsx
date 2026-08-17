import { useState, useEffect } from "react"
import { getStaff, createStaff, deleteStaff, type StaffMember } from "@/api/staff"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Trash2, Users } from "lucide-react"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { useNavigate } from "react-router-dom"

export default function StaffPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.role !== "owner") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const data = await getStaff()
      setStaff(data)
    } catch {
      toast.error("Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Please fill all fields")
      return
    }
    setSubmitting(true)
    try {
      await createStaff(form)
      toast.success("Staff member added")
      setAddOpen(false)
      setForm({ name: "", email: "", phone: "", password: "" })
      loadStaff()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add staff")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    const ok = window.confirm(`Remove ${name} from your staff?`)
    if (!ok) return
    try {
      await deleteStaff(id)
      toast.success("Staff member removed")
      loadStaff()
    } catch {
      toast.error("Failed to remove staff")
    }
  }

  if (user?.role !== "owner") return null

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your shop staff accounts
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : staff.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No staff members yet
              </p>
              <p className="text-xs text-muted-foreground">
                Add staff to help manage your shop
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.phone || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id, s.name)}
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

      {/* Add Staff Dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Add Staff Member</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a new staff account for your shop
            </p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Staff member name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="staff@shop.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddOpen(false)
                    setForm({ name: "", email: "", phone: "", password: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
