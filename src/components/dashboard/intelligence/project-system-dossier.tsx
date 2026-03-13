import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/i18n/format"
import { translateFields, translateText } from "@/lib/i18n/dynamic-translation"
import { getI18n } from "@/lib/i18n/server"
import type { getProjectSystemDossier } from "@/lib/dashboard/intelligence"

type ProjectSystemDossierProps = {
  dossier: NonNullable<Awaited<ReturnType<typeof getProjectSystemDossier>>>
}

export async function ProjectSystemDossier({ dossier }: ProjectSystemDossierProps) {
  const { locale, t } = await getI18n()
  const architectureBlocks = await Promise.all(
    dossier.architectureBlocks.map(async (block) => ({
      ...block,
      evidence: await Promise.all(
        block.evidence.map((item, index) =>
          translateText({
            entityType: "dossier-architecture-evidence",
            entityId: `${dossier.project.id}:${block.label}:${index}`,
            field: "value",
            locale,
            value: item,
          }).then((translated) => translated ?? item)
        )
      ),
    }))
  )
  const capabilities = await Promise.all(
    dossier.capabilities.map(async (capability) => ({
      ...capability,
      evidence: await Promise.all(
        capability.evidence.map((item, index) =>
          translateText({
            entityType: "dossier-capability-evidence",
            entityId: `${dossier.project.id}:${capability.key}:${index}`,
            field: "value",
            locale,
            value: item,
          }).then((translated) => translated ?? item)
        )
      ),
    }))
  )
  const architectureGaps = await Promise.all(
    dossier.architectureGaps.map(async (gap) => {
      const translated = await translateFields({
        entityType: "dossier-architecture-gap",
        entityId: `${gap.source}:${gap.title}`,
        locale,
        fields: {
          title: gap.title,
          reason: gap.reason,
        },
      })

      return {
        ...gap,
        title: translated.title ?? gap.title,
        reason: translated.reason ?? gap.reason,
      }
    })
  )
  const claimLedger = await Promise.all(
    dossier.claimLedger.map(async (claim) => {
      const translated = await translateFields({
        entityType: "dossier-claim",
        entityId: `${dossier.project.id}:${claim.label}`,
        locale,
        fields: {
          detail: claim.detail,
          contradiction: claim.contradiction,
        },
      })

      return {
        ...claim,
        detail: translated.detail ?? claim.detail,
        contradiction: translated.contradiction ?? claim.contradiction,
      }
    })
  )
  const evidence = await Promise.all(
    dossier.evidence.map(async (item) => {
      const translated = await translateFields({
        entityType: "dossier-evidence",
        entityId: item.id,
        locale,
        fields: {
          excerpt: item.excerpt,
        },
      })

      return {
        ...item,
        excerpt: translated.excerpt ?? item.excerpt,
      }
    })
  )
  const lineageHypotheses = await Promise.all(
    dossier.lineageHypotheses.map(async (peer) => {
      const translated = await translateFields({
        entityType: "dossier-lineage",
        entityId: peer.id,
        locale,
        fields: {
          rationale: peer.rationale,
        },
      })

      return {
        ...peer,
        rationale: translated.rationale ?? peer.rationale,
      }
    })
  )

  return (
    <section className="grid gap-6">
      <Card className="py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{t("dashboard.dossier.title")}</CardTitle>
              <CardDescription>{t("dashboard.dossier.description")}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{dossier.capabilityCount} {t("dashboard.dossier.activeCapabilities")}</Badge>
              <Badge variant="secondary">{t("dashboard.dossier.confidence")} {dossier.project.confidenceScore}%</Badge>
              <Badge variant="outline">
                {dossier.latestSnapshot ? `${dossier.evidence.length} ${t("dashboard.dossier.evidenceRowsShown")}` : t("dashboard.dossier.noSnapshotYet")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1.25fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {architectureBlocks.map((block) => (
                <div key={block.label} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{block.label}</div>
                    <Badge
                      variant={
                        block.status === "strong"
                          ? "secondary"
                          : block.status === "emerging"
                            ? "outline"
                            : "ghost"
                      }
                    >
                      {block.status}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">{block.confidence}% {t("dashboard.dossier.confidence").toLowerCase()}</div>
                  {block.modules.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {block.modules.map((module) => (
                        <Badge key={module} variant="outline">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {block.evidence.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {block.evidence.map((item, index) => (
                        <li key={`${block.label}-${index}-${item}`}> - {item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {t("dashboard.dossier.noLayerEvidence")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-background">
              <div className="grid grid-cols-[minmax(0,1fr)_120px_110px] gap-3 border-b px-4 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <div>{t("dashboard.dossier.capability")}</div>
                <div>{t("dashboard.dossier.state")}</div>
                <div>{t("dashboard.dossier.confidence")}</div>
              </div>
              <div className="divide-y">
                {capabilities.map((capability) => (
                  <div key={capability.key} className="grid grid-cols-[minmax(0,1fr)_120px_110px] gap-3 px-4 py-4">
                    <div>
                      <div className="text-sm font-medium">{capability.label}</div>
                      <div className="mt-1 text-sm leading-6 text-muted-foreground">
                        {capability.summary}
                      </div>
                      {capability.evidence.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {capability.evidence.map((item, index) => (
                            <Badge key={`${capability.key}-${index}-${item}`} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="pt-0.5">
                      <Badge
                        variant={
                          capability.state === "observed"
                            ? "secondary"
                            : capability.state === "inferred"
                              ? "outline"
                              : "ghost"
                        }
                      >
                        {capability.state}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">{capability.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="py-0 shadow-none">
              <CardHeader className="border-b py-4">
                <CardTitle>{t("dashboard.dossier.benchmarkProxies")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 py-4">
                {dossier.benchmarkCards.map((card) => (
                  <div key={card.label} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{card.label}</div>
                      <Badge variant="outline">P{card.percentile}</Badge>
                    </div>
                    <div className="mt-2 text-lg font-medium">{card.value}/100</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("dashboard.dossier.cohortAverage")} {card.cohortAverage}/100
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="py-0 shadow-none">
              <CardHeader className="border-b py-4">
                <CardTitle>{t("dashboard.dossier.architectureGapFinder")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                {architectureGaps.length > 0 ? (
                  architectureGaps.map((gap) => (
                    <div key={`${gap.source}-${gap.title}`} className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{gap.title}</div>
                        <Badge variant="outline">{gap.source}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{gap.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">{t("dashboard.dossier.noGaps")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("dashboard.dossier.evidenceLedger")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            {claimLedger.map((claim) => (
              <div key={claim.label} className="rounded-lg border bg-muted/15 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">{claim.label}</div>
                  <Badge variant="outline">{claim.provenance}</Badge>
                  <Badge variant={claim.freshness === "stale" ? "ghost" : "secondary"}>
                    {claim.freshness}
                  </Badge>
                  <Badge variant="outline">{claim.reliability}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{claim.detail}</p>
                {claim.contradiction ? (
                  <p className="mt-2 text-sm leading-6 text-destructive">{claim.contradiction}</p>
                ) : null}
                {claim.snapshotDate ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("dashboard.dossier.snapshot")} {formatDateTime(claim.snapshotDate, locale)}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>{t("dashboard.dossier.traceableEvidence")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-5">
              {evidence.length > 0 ? (
                evidence.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-muted/15 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{item.label}</div>
                      <Badge variant="outline">{item.confidence}%</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
                    <Link
                      href={item.sourceUrl}
                      className="mt-2 inline-flex text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {item.sourceUrl}
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">{t("dashboard.dossier.evidenceEmpty")}</p>
              )}
            </CardContent>
          </Card>

          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>{t("dashboard.dossier.genealogyPreview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-5">
              {lineageHypotheses.length > 0 ? (
                lineageHypotheses.map((peer) => (
                  <div key={peer.id} className="rounded-lg border bg-muted/15 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/projects/${peer.slug}`} className="text-sm font-medium hover:underline">
                        {peer.name}
                      </Link>
                      <Badge variant="outline">{peer.similarityScore}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{peer.rationale}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">{t("dashboard.dossier.genealogyEmpty")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  )
}
