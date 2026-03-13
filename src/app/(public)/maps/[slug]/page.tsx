import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RadarTargetCard } from "@/components/research/radar-target-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMarketMapBySlug } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const map = await getMarketMapBySlug(slug)

  return {
    title: map?.title ?? "Map",
    description: map?.summary,
  }
}

export default async function MarketMapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getSession()
  const { slug } = await params
  const map = await getMarketMapBySlug(slug)

  if (!map) {
    notFound()
  }

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-[-0.05em]">{map.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">{map.summary}</p>
          </div>
          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>Map read</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-5">
              <div className="text-sm text-muted-foreground">
                {map.members.length} tracked products
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(map.clusterBreakdown).map(([label, count]) => (
                  <Badge key={label} variant="outline">
                    {label} ({count})
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Missing archetypes</div>
                <div className="flex flex-wrap gap-2">
                  {map.missingArchetypes.length > 0 ? (
                    map.missingArchetypes.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No major whitespace flagged.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {map.notableMovers.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Notable movers</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Products with recent strategic shifts inside this market map.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
              {map.notableMovers.map((target) => (
                <RadarTargetCard key={target.id} target={target} allowClaim={Boolean(session)} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Tracked products</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The current landscape membership for this map.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {map.members.map((target) => (
              <RadarTargetCard key={target.id} target={target} allowClaim={Boolean(session)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
