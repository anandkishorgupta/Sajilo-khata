import { useEffect, useState } from "react"
import { getAdminPayments } from "@/api/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

type Payment = {
    id: number
    pidx: string
    amount: number
    status: string
    transactionId: string | null
    purchaseOrderId: string
    shopId: number
    shopName: string
    createdAt: string
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const loadPayments = async () => {
        setLoading(true)
        try {
            const res = await getAdminPayments({ page, status: statusFilter })
            setPayments(res.data)
            setTotalPages(res.totalPages)
        } catch {
            toast.error("Failed to load payments")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPayments()
    }, [page, statusFilter])

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Payments</h1>

            <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <select
                        className="rounded border px-3 py-2 text-sm outline-none"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                    >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shop</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment ID</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.shopName || "N/A"}</TableCell>
                                        <TableCell>Rs {(p.amount / 100).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    p.status === "completed"
                                                        ? "default"
                                                        : p.status === "pending"
                                                        ? "secondary"
                                                        : "destructive"
                                                }
                                            >
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{p.pidx}</TableCell>
                                        <TableCell className="text-xs">{p.purchaseOrderId}</TableCell>
                                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
