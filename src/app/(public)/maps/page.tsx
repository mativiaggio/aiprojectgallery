import type { Metadata } from "next"

import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getI18n } from "@/lib/i18n/server"
import { getMarketMaps } from "@/lib/research/service"

export const metadata: Metadata = {
  title: "Maps",
}

export default async function MapsPage() {
  const { t } = await getI18n()
  const maps = await getMarketMaps()

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.maps.title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("publicPages.maps.description")}
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {maps.map((map) => (
            <Link key={map.id} href={`/maps/${map.slug}`}>
              <Card className="h-full py-0 shadow-none transition-colors hover:bg-muted/20">
                <CardHeader className="border-b py-5">
                  <CardTitle>{map.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-5">
                  <p className="text-sm leading-7 text-muted-foreground">{map.summary}</p>
                  <div className="text-sm text-muted-foreground">
                    {map.memberCount} {t("publicPages.maps.trackedProducts")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
