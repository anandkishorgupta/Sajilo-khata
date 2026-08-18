import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { adminLogin } from "@/api/admin"
import { adminLoginSuccess } from "@/store/slices/adminSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminLoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Please fill all fields")
            return
        }
        setLoading(true)
        try {
            const res = await adminLogin(email, password)
            localStorage.setItem("admin_token", res.access_token)
            localStorage.setItem("admin_user", JSON.stringify(res.admin))
            dispatch(adminLoginSuccess({ admin: res.admin, token: res.access_token }))
            toast.success("Welcome, Admin!")
            navigate("/admin")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground">Sign in to manage Sajilo Khata</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@sajilokhata.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
