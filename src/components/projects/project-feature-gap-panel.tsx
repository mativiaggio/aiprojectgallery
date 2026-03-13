import { AlertCircle, Lightbulb, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ProjectFeatureGapPanelProps = {
  gaps: Array<{
    featureKey: string
    title: string
    reason: string
    impact: string
    confidence: number
    evidence: string[]
    implementationHint: string
    status: string
    updatedAt: Date
  }>
  lastAnalyzedAt: Date | null
}

export function ProjectFeatureGapPanel({
  gaps,
  lastAnalyzedAt,
}: ProjectFeatureGapPanelProps) {
  const prioritized = gaps.filter((gap) => gap.status !== "dismissed")
  const highImpactCount = prioritized.filter((gap) => gap.impact === "high").length
  const averageConfidence =
    prioritized.length > 0
      ? Math.round(
          prioritized.reduce((sum, gap) => sum + gap.confidence, 0) / prioritized.length
        )
      : 0

  return (
    <Card className="py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Feature gap analysis</CardTitle>
            <CardDescription>
              Deterministic recommendations based on the current launch surface, research signals,
              and credibility posture.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{prioritized.length} recommendations</Badge>
            <Badge variant="secondary">{highImpactCount} high-impact</Badge>
            <Badge variant="outline">Confidence {averageConfidence}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 py-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 text-emerald-600" />
            <div className="space-y-1 text-sm leading-6 text-muted-foreground">
              <p>
                {prioritized.length > 0
                  ? `The current submission shows ${prioritized.length} concrete feature opportunities. Prioritize the high-impact items first, then use the implementation hints to shape the next iteration.`
                  : "No major feature gaps are currently flagged. This launch surface already communicates its positioning clearly."}
              </p>
              <p>
                {lastAnalyzedAt
                  ? `Last refreshed ${lastAnalyzedAt.toLocaleString()}.`
                  : "Analysis will become more confident as more public signals are captured."}
              </p>
            </div>
          </div>
        </div>

        {prioritized.length > 0 ? (
          <div className="grid gap-4">
            {prioritized.map((gap) => (
              <div key={gap.featureKey} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium tracking-[-0.02em]">{gap.title}</h3>
                      <Badge variant={gap.impact === "high" ? "secondary" : "outline"}>
                        {gap.impact} impact
                      </Badge>
                      <Badge variant="outline">{gap.confidence}% confidence</Badge>
                      {gap.status !== "recommended" ? (
                        <Badge variant="outline">{gap.status}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{gap.reason}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="size-4" />
                      Observed evidence
                    </div>
                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                      {gap.evidence.length > 0 ? (
                        gap.evidence.slice(0, 3).map((evidence, index) => (
                          <li key={`${gap.featureKey}-${index}-${evidence}`}>- {evidence}</li>
                        ))
                      ) : (
                        <li>- Evidence is still limited, so this recommendation is more exploratory.</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Lightbulb className="size-4" />
                      Implementation hint
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {gap.implementationHint}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/15 p-5 text-sm leading-6 text-muted-foreground">
            Refresh the analysis after major landing-page or product changes to keep the recommendations current.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
