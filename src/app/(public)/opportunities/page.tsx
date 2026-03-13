import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getI18n } from "@/lib/i18n/server"
import { getOpportunityClusters } from "@/lib/research/service"

export const metadata: Metadata = {
  title: "Opportunities",
}

export default async function OpportunitiesPage() {
  const { t } = await getI18n()
  const clusters = await getOpportunityClusters()

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.opportunities.title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("publicPages.opportunities.description")}
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="py-0 shadow-none">
              <CardHeader className="border-b py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>{cluster.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{cluster.impact}</Badge>
                    <Badge variant="secondary">{cluster.targetCount} {t("publicPages.opportunities.products")}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <p className="text-sm leading-7 text-muted-foreground">{cluster.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {cluster.evidence.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}
