import { getPlanInfo } from "@/api/payment"
import { getProfile } from "@/api/settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/services/api-client"
import { Calendar, CheckCircle2, Crown, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
type PlanInfo = {
  name: string
  price: number
  durationDays: number
  features: string[]
}

export default function SubscriptionPage() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)

  const [shop, setShop] = useState<{
    plan: "trial" | "pro"
    expiresAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile()
        setShop(profile.shop)

        const info = await getPlanInfo()
        setPlanInfo(info?.data)
      } catch {
        toast.error("Failed loading subscription")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const getDaysLeft = (dateStr: string | null) => {
    if (!dateStr) return null

    const expiry = new Date(dateStr)
    const today = new Date()

    const diff = expiry.getTime() - today.getTime()

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)

      const res = await api.post("/payments/initiate")

      window.location.href = res.data.data.payment_url
    } catch (err) {
      toast.error("Failed to start payment")
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    )
  }

  const daysLeft = getDaysLeft(shop?.expiresAt ?? null)

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your Sajilo Khata subscription
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>

            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {shop?.plan === "pro" ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-500" />

                  <Badge className="bg-yellow-500 text-white">Pro</Badge>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-blue-500" />

                  <Badge variant="outline">Trial</Badge>
                </>
              )}
            </div>

            {shop?.expiresAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm text-muted-foreground">
                  {daysLeft} days remaining
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Sajilo Khata Pro
            </CardTitle>

            <CardDescription>Unlock all premium features</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">Rs {planInfo?.price}</span>

              <span className="text-muted-foreground">
                / {planInfo?.durationDays} days
              </span>
            </div>

            <ul className="mb-6 space-y-3">
              {planInfo?.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />

                  {feature}
                </li>
              ))}
            </ul>
            {shop?.plan === "trial" ? (
              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full cursor-pointer"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Upgrade with Khalti"
                )}
              </Button>
            ) : (
              <Button disabled className="w-full">
                Current Plan: Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
