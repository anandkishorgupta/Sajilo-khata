import type { UserProfile } from "@/api/settings"
import {
  changePassword,
  getProfile,
  updateProfile,
  updateShop,
} from "@/api/settings"
import {
  getAuditLogs,
  getAuditLogStats,
  type AuditLogEntry,
  type AuditLogStats,
} from "@/api/audit-log"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calendar,
  Crown,
  History,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Store,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function SettingsPage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Shop form
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [savingShop, setSavingShop] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  // Audit Log state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [auditStats, setAuditStats] = useState<AuditLogStats | null>(null)
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditEntityFilter, setAuditEntityFilter] = useState("")
  const [auditActionFilter, setAuditActionFilter] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await getProfile()
      setProfile(data)
      setName(data.name)
      setEmail(data.email)
      setShopName(data.shop.name)
      setShopAddress(data.shop.address)
      setShopPhone(data.shop.phone)
    } catch {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSavingProfile(true)
      const updated = await updateProfile({ name, email })
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev))
      toast.success("Profile updated")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleUpdateShop(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSavingShop(true)
      const updated = await updateShop({
        name: shopName,
        address: shopAddress,
        phone: shopPhone,
      })
      setProfile((prev) =>
        prev ? { ...prev, shop: { ...prev.shop, ...updated } } : prev
      )
      toast.success("Shop details updated")
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update shop details"
      )
    } finally {
      setSavingShop(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    try {
      setSavingPassword(true)
      await changePassword({ currentPassword, newPassword })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password")
    } finally {
      setSavingPassword(false)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  async function loadAuditLogs(page = 1) {
    setAuditLoading(true)
    try {
      const [logsRes, stats] = await Promise.all([
        getAuditLogs({
          page,
          limit: 15,
          entityType: auditEntityFilter || undefined,
          action: auditActionFilter || undefined,
        }),
        getAuditLogStats(),
      ])
      setAuditLogs(logsRes.data)
      setAuditTotalPages(logsRes.totalPages)
      setAuditPage(logsRes.page)
      setAuditStats(stats)
    } catch {
      toast.error("Failed to load activity log")
    } finally {
      setAuditLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs(1)
  }, [auditEntityFilter, auditActionFilter])

  function getPlanBadge(plan: string) {
    switch (plan) {
      case "pro":
        return (
          <Badge className="border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            Pro
          </Badge>
        )

      default:
        return <Badge variant="outline">Trial</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  function getDaysLeft(dateStr: string | null) {
    if (!dateStr) return null

    const expiry = new Date(dateStr)
    const today = new Date()

    const diff = expiry.getTime() - today.getTime()

    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, shop details, and security preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-2">
            <Store className="h-4 w-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Edit Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your name and email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full"
                  >
                    {savingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Details
                </CardTitle>
                <CardDescription>
                  Your account information at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(profile?.createdAt ?? null)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      <div className="mt-1 flex items-center gap-2">
                        {getPlanBadge(profile?.shop.plan ?? "trial")}
                      </div>
                    </div>
                  </div>
                </div>
                {profile?.shop.expiresAt && (
                  <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {profile?.shop.plan === "trial"
                            ? "Trial Ends"
                            : "Subscription Expires"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {formatDate(profile.shop.expiresAt)}
                        </p>

                        <p className="text-xs text-orange-600">
                          {getDaysLeft(profile.shop.expiresAt)} days remaining
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {profile?.shop.plan === "trial" &&
                  getDaysLeft(profile.shop.expiresAt) !== null &&
                  getDaysLeft(profile.shop.expiresAt)! > 0 && (
                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Upgrade to Pro
                        </CardTitle>

                        <CardDescription>
                          Unlock premium features and continue using Sajilo
                          Khata without interruption.
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <ul className="mb-4 space-y-2 text-sm">
                          <li>✓ Unlimited billing</li>
                          <li>✓ AI Assistant</li>
                          <li>✓ Advanced analytics</li>
                          <li>✓ Priority support</li>
                        </ul>

                        <Button
                          className="w-full"
                          onClick={() => navigate("/dashboard/subscription")}
                        >
                          Upgrade Now
                        </Button>
                      </CardContent>
                    </Card>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Shop Tab ── */}
        <TabsContent value="shop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Information
              </CardTitle>
              <CardDescription>
                Update your business name, address, and contact number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateShop} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <div className="relative">
                    <Store className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="shopName"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Your business name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="shopAddress"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="Shop address"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="shopPhone"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="+977-XXXXXXXXXX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                <Button type="submit" disabled={savingShop} className="w-full">
                  {savingShop ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Update Shop Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    savingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="w-full"
                >
                  {savingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Activity Log Tab ── */}
        <TabsContent value="activity" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">
                    {auditStats?.total ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {auditStats?.todayCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {auditStats?.weekCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <select
                  value={auditEntityFilter}
                  onChange={(e) => setAuditEntityFilter(e.target.value)}
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Entities</option>
                  <option value="Sale">Sales</option>
                  <option value="Purchase">Purchases</option>
                  <option value="Product">Products</option>
                  <option value="Expense">Expenses</option>
                  <option value="Khata">Khata</option>
                  <option value="Staff">Staff</option>
                  <option value="Auth">Auth</option>
                  <option value="Shop">Shop</option>
                </select>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Created</option>
                  <option value="UPDATE">Updated</option>
                  <option value="DELETE">Deleted</option>
                  <option value="LOGIN">Login</option>
                  <option value="STAFF_ADD">Staff Added</option>
                  <option value="STAFF_REMOVE">Staff Removed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Log Table */}
          <Card>
            <CardContent className="p-0">
              {auditLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No activity recorded yet
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {log.userName || "System"}
                              </span>
                              {log.userRole && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {log.userRole}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.action === "DELETE"
                                  ? "border-red-500/30 text-red-600"
                                  : log.action === "CREATE" ||
                                    log.action === "STAFF_ADD"
                                    ? "border-green-500/30 text-green-600"
                                    : log.action === "LOGIN"
                                      ? "border-blue-500/30 text-blue-600"
                                      : ""
                              }
                            >
                              {log.action === "STAFF_ADD"
                                ? "Staff Added"
                                : log.action === "STAFF_REMOVE"
                                  ? "Staff Removed"
                                  : log.action.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {log.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {auditTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t p-4">
                      <p className="text-sm text-muted-foreground">
                        Page {auditPage} of {auditTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={auditPage <= 1}
                          onClick={() => loadAuditLogs(auditPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={auditPage >= auditTotalPages}
                          onClick={() => loadAuditLogs(auditPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Users */}
          {auditStats?.byUser && auditStats.byUser.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditStats.byUser.map((u, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(u.userName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.userRole}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{u.count} actions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
