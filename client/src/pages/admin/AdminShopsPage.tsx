import { useEffect, useState } from "react"
import { getAdminShops, extendShop } from "@/api/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

type Shop = {
    id: number
    name: string
    address: string
    phone: string
    plan: string
    expiresAt: string | null
    createdAt: string
    userCount: number
    isExpired: boolean
}

export default function AdminShopsPage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [planFilter, setPlanFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [extending, setExtending] = useState<number | null>(null)

    const loadShops = async () => {
        setLoading(true)
        try {
            const res = await getAdminShops({ search, plan: planFilter, page })
            setShops(res.data)
            setTotalPages(res.totalPages)
        } catch {
            toast.error("Failed to load shops")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadShops()
    }, [page, planFilter])

    const handleExtend = async (shopId: number, days: number) => {
        setExtending(shopId)
        try {
            await extendShop(shopId, days)
            toast.success(`Shop extended by ${days} days`)
            loadShops()
        } catch {
            toast.error("Failed to extend shop")
        } finally {
            setExtending(null)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Shops</h1>

            <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <input
                        className="rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Search shop name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadShops()}
                    />
                    <select
                        className="rounded border px-3 py-2 text-sm outline-none"
                        value={planFilter}
                        onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
                    >
                        <option value="">All Plans</option>
                        <option value="trial">Trial</option>
                        <option value="pro">Pro</option>
                    </select>
                    <Button size="sm" onClick={loadShops}>Search</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shop</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : shops.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No shops found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shops.map((shop) => (
                                    <TableRow key={shop.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{shop.name}</p>
                                                <p className="text-xs text-muted-foreground">{shop.address}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{shop.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant={shop.plan === "pro" ? "default" : "outline"}>
                                                {shop.plan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {shop.expiresAt
                                                ? new Date(shop.expiresAt).toLocaleDateString()
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>{shop.userCount}</TableCell>
                                        <TableCell>
                                            <Badge variant={shop.isExpired ? "destructive" : "default"}>
                                                {shop.isExpired ? "Expired" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={extending === shop.id}
                                                    onClick={() => handleExtend(shop.id, 30)}
                                                >
                                                    +30d
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={extending === shop.id}
                                                    onClick={() => handleExtend(shop.id, 365)}
                                                >
                                                    +1y
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
