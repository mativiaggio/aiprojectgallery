import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getI18n } from "@/lib/i18n/server"
import { getResearchProjectsByIds } from "@/lib/research/service"

export const metadata: Metadata = {
  title: "Compare",
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { t } = await getI18n()
  const params = await searchParams
  const ids = (params.ids ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4)
  const projects = await getResearchProjectsByIds(ids)

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.compare.title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("publicPages.compare.description")}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projects.map((project) => (
            <Card key={project.id} className="py-0 shadow-none">
              <CardHeader className="border-b py-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{project.name}</CardTitle>
                  <Badge variant="outline">{project.credibilityScore}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 py-4 text-sm">
                <CompareRow label={t("publicPages.compare.useCase")} value={project.primaryUseCase} />
                <CompareRow label={t("publicPages.compare.buyer")} value={project.buyerType} />
                <CompareRow label={t("publicPages.compare.interaction")} value={project.interactionModel} />
                <CompareRow label={t("publicPages.compare.pricing")} value={project.pricingVisibility} />
                <CompareRow label={t("publicPages.compare.surface")} value={project.deploymentSurface} />
                <CompareRow label={t("publicPages.compare.models")} value={project.modelVendorMix} />
                <CompareRow label={t("publicPages.compare.docs")} value={project.docsDetected ? t("common.yes") : t("common.no")} />
                <CompareRow label={t("publicPages.compare.demoCta")} value={project.demoCtaDetected ? t("common.yes") : t("common.no")} />
                <CompareRow label={t("publicPages.compare.authWall")} value={project.authWallDetected ? t("common.yes") : t("common.no")} />
                <CompareRow label={t("publicPages.compare.proof")} value={project.proofPoints.join(", ") || t("publicPages.compare.none")} />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}

function CompareRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-t pt-3 first:border-t-0 first:pt-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value || "Unknown"}</div>
    </div>
  )
}
