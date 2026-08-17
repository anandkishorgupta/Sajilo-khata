import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"
import { fetchAiInsights } from "./data"

export default function AiInsightsCard() {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAiInsights()
      .then((res) => setInsight(res.insight))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (!insight) return null

  return (
    <Card className="shadow-soft border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary">
            AI Insight
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {insight}
        </p>
      </CardContent>
    </Card>
  )
}
