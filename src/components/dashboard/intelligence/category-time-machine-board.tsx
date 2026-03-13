import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeMachineCategory } from "@/lib/dashboard/intelligence"

export function CategoryTimeMachineBoard({
  categories,
}: {
  categories: TimeMachineCategory[]
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.slice(0, 3).map((category) => (
          <Card key={category.label} className="py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle>{category.label}</CardTitle>
              <CardDescription>{category.projectCount} tracked products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 py-4 text-sm text-muted-foreground">
              <div>Recent change velocity {category.changeVelocity}</div>
              <div>Average credibility {category.averageCredibility}/100</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.label} className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>{category.label}</CardTitle>
                  <CardDescription>
                    {category.projectCount} products, {category.changeVelocity} meaningful changes in the
                    last 30 days.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Credibility {category.averageCredibility}</Badge>
                  <Badge variant="secondary">Docs {category.latestDocsShare}%</Badge>
                  <Badge variant="outline">Pricing {category.latestPricingShare}%</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 py-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <TrendStat label="Docs visibility" value={category.latestDocsShare} delta={category.docsDelta} />
                <TrendStat label="Pricing visibility" value={category.latestPricingShare} delta={category.pricingDelta} />
                <TrendStat label="Demo posture" value={category.latestDemoShare} delta={category.demoDelta} />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Monthly trend</div>
                <div className="grid gap-3 md:grid-cols-5">
                  {category.timeline.map((point) => (
                    <div key={point.label} className="rounded-lg border bg-muted/20 p-3">
                      <div className="text-sm font-medium">{point.label}</div>
                      <div className="mt-3 space-y-2">
                        <SparkRow label="Docs" value={point.docsShare} />
                        <SparkRow label="Pricing" value={point.pricingShare} />
                        <SparkRow label="Demo" value={point.demoShare} />
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Sample {point.sampleSize}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TrendStat({
  label,
  value,
  delta,
}: {
  label: string
  value: number
  delta: number
}) {
  const tone = delta > 0 ? "secondary" : delta < 0 ? "ghost" : "outline"
  const formattedDelta = delta > 0 ? `+${delta}` : `${delta}`

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-lg font-medium">{value}%</div>
        <Badge variant={tone}>{formattedDelta}</Badge>
      </div>
    </div>
  )
}

function SparkRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/80" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
