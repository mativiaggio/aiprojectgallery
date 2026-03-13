import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDateTime } from "@/lib/i18n/format"
import { translateFields } from "@/lib/i18n/dynamic-translation"
import { getI18n } from "@/lib/i18n/server"

type ForensicsSnapshot = {
  id: string
  capturedAt: Date
  executiveAbstract: string | null
  forensicSummary: string | null
  summary: string | null
  pagesVisited: number
  evidenceCount: number
  coverageScore: number
}

type ForensicsPage = {
  id: string
  url: string
  pageType: string
  statusCode: number
  finalUrl: string
  title: string | null
  canonicalUrl: string | null
  metaDescription: string | null
  htmlHash: string | null
  textHash: string | null
  capturedAt: Date
}

type ForensicsEvidence = {
  id: string
  snapshotPageId: string | null
  category: string
  signalKey: string
  label: string
  value: string
  excerpt: string
  sourceUrl: string
  confidence: number
}

type ForensicsRun = {
  id: string
  status: string
  trigger: string
  queuedAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  errorMessage: string | null
  pagesAttempted: number
  pagesSucceeded: number
}

type TimelineItem = {
  id: string
  title: string
  detail: string
  impact: string
  detectedAt: Date
}

export async function ProjectForensicsReport({
  project,
  forensics,
  changes,
}: {
  project: {
    executiveAbstract: string | null
    forensicSummary: string | null
    methodologyNote: string | null
    coverageScore: number
    pagesVisited: number
    confidenceScore: number
    marketClarityScore: number
    conversionScore: number
    trustScore: number
    technicalDepthScore: number
    proofScore: number
    freshnessScore: number
    evidenceSnippets: string[]
  }
  forensics: {
    snapshot: ForensicsSnapshot | null
    pages: ForensicsPage[]
    evidence: ForensicsEvidence[]
    latestRun: ForensicsRun | null
  }
  changes: TimelineItem[]
}) {
  const { locale, t } = await getI18n()
  const summaryCopy = await translateFields({
    entityType: "forensics-project",
    entityId: forensics.snapshot?.id ?? "pending",
    locale,
    fields: {
      executiveAbstract: forensics.snapshot?.executiveAbstract ?? project.executiveAbstract,
      forensicSummary: forensics.snapshot?.forensicSummary ?? project.forensicSummary,
      methodologyNote: project.methodologyNote,
    },
  })
  const translatedChanges = await Promise.all(
    changes.slice(0, 6).map(async (change) => {
      const translated = await translateFields({
        entityType: "forensics-change",
        entityId: change.id,
        locale,
        fields: {
          title: change.title,
          detail: change.detail,
        },
      })

      return {
        ...change,
        title: translated.title ?? change.title,
        detail: translated.detail ?? change.detail,
      }
    })
  )
  const sections = [
    {
      key: "market",
      title: "Market clarity",
      score: project.marketClarityScore,
      items: forensics.evidence.filter((item) => item.category === "market").slice(0, 4),
    },
    {
      key: "conversion",
      title: "Conversion",
      score: project.conversionScore,
      items: forensics.evidence.filter((item) => item.category === "conversion").slice(0, 4),
    },
    {
      key: "trust",
      title: "Trust and proof",
      score: project.trustScore,
      items: forensics.evidence.filter((item) => item.category === "trust" || item.category === "proof").slice(0, 5),
    },
    {
      key: "technical",
      title: "Technical depth",
      score: project.technicalDepthScore,
      items: forensics.evidence.filter((item) => item.category === "technical").slice(0, 4),
    },
    {
      key: "freshness",
      title: "Freshness",
      score: project.freshnessScore,
      items: forensics.evidence.filter((item) => item.category === "freshness").slice(0, 4),
    },
  ]

  if (!forensics.snapshot) {
    return (
        <Card className="py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>{t("publicPages.forensics.title")}</CardTitle>
          <CardDescription>{t("publicPages.forensics.waiting")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-5 text-sm leading-7 text-muted-foreground">
          <p>
            {forensics.latestRun
              ? `${t("publicPages.forensics.latestRun")}: ${forensics.latestRun.status}. ${t("publicPages.forensics.trigger")}: ${forensics.latestRun.trigger}.`
              : t("publicPages.forensics.noSnapshot")}
          </p>
          {forensics.latestRun?.errorMessage ? <p>{forensics.latestRun.errorMessage}</p> : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.executiveAbstract")}</CardTitle>
            <CardDescription>
              Snapshot captured {formatDateTime(forensics.snapshot.capturedAt, locale)} with{" "}
              {forensics.snapshot.pagesVisited} pages and {forensics.snapshot.evidenceCount} evidence rows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            <p className="text-sm leading-7 text-foreground">
              {summaryCopy.executiveAbstract ?? t("publicPages.forensics.noExecutiveAbstract")}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              {summaryCopy.forensicSummary ?? t("publicPages.forensics.noForensicInterpretation")}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatBlock label={t("publicPages.forensics.coverage")} value={`${forensics.snapshot.coverageScore}%`} />
              <StatBlock label={t("publicPages.forensics.confidence")} value={`${project.confidenceScore}/100`} />
              <StatBlock label={t("publicPages.forensics.pagesVisited")} value={String(forensics.snapshot.pagesVisited)} />
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.methodology")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-5 text-sm leading-7 text-muted-foreground">
            <p>{summaryCopy.methodologyNote ?? t("publicPages.forensics.fallbackMethodology")}</p>
            <DetailRow label={t("publicPages.forensics.latestRunLabel")} value={forensics.latestRun ? `${forensics.latestRun.status} • ${forensics.latestRun.trigger}` : "Unknown"} />
            <DetailRow
              label={t("publicPages.forensics.runCoverage")}
              value={
                forensics.latestRun
                  ? `${forensics.latestRun.pagesSucceeded}/${Math.max(forensics.latestRun.pagesAttempted, forensics.snapshot.pagesVisited)} pages`
                  : `${forensics.snapshot.pagesVisited} pages`
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.scoreBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            <ScoreRow label={t("publicPages.forensics.marketClarity")} value={project.marketClarityScore} />
            <ScoreRow label={t("publicPages.forensics.conversion")} value={project.conversionScore} />
            <ScoreRow label={t("publicPages.forensics.trust")} value={project.trustScore} />
            <ScoreRow label={t("publicPages.forensics.technicalDepth")} value={project.technicalDepthScore} />
            <ScoreRow label={t("publicPages.forensics.proofDensity")} value={project.proofScore} />
            <ScoreRow label={t("publicPages.forensics.freshness")} value={project.freshnessScore} />
            <ScoreRow label={t("publicPages.forensics.crawlCoverage")} value={project.coverageScore} />
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.crawlMap")}</CardTitle>
            <CardDescription>{t("publicPages.forensics.crawlMapDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-5">
            {forensics.pages.map((page) => (
              <div key={page.id} className="grid gap-2 rounded-lg border bg-muted/15 p-3 md:grid-cols-[110px_minmax(0,1fr)_90px] md:items-start">
                <div className="space-y-2">
                  <Badge variant="outline">{page.pageType}</Badge>
                  <div className="text-xs text-muted-foreground">HTTP {page.statusCode}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{page.title ?? page.finalUrl}</div>
                  <Link href={page.finalUrl} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    {page.finalUrl}
                  </Link>
                  {page.metaDescription ? (
                    <p className="text-sm leading-6 text-muted-foreground">{page.metaDescription}</p>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(page.capturedAt, locale)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.evidenceMatrix")}</CardTitle>
            <CardDescription>{t("publicPages.forensics.evidenceMatrixDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-5">
            <div className="grid grid-cols-[110px_minmax(0,180px)_minmax(0,1fr)_90px] gap-3 border-b pb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <div>{t("publicPages.forensics.category")}</div>
              <div>{t("publicPages.forensics.signal")}</div>
              <div>{t("publicPages.forensics.excerpt")}</div>
              <div>{t("publicPages.forensics.confidence")}</div>
            </div>
            {forensics.evidence.slice(0, 18).map((item) => (
              <div key={item.id} className="grid grid-cols-[110px_minmax(0,180px)_minmax(0,1fr)_90px] gap-3 border-b border-border/60 py-3 text-sm last:border-b-0">
                <div>{item.category}</div>
                <div className="font-medium">{item.label}</div>
                <div className="space-y-1">
                  <p className="leading-6 text-muted-foreground">{item.excerpt}</p>
                  <Link href={item.sourceUrl} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    {item.sourceUrl}
                  </Link>
                </div>
                <div>{item.confidence}%</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{t("publicPages.forensics.recentChanges")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-5">
            {translatedChanges.length > 0 ? (
              translatedChanges.map((change) => (
                <div key={change.id} className="rounded-lg border bg-muted/15 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{change.title}</div>
                    <Badge variant="outline">{change.impact}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{change.detail}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(change.detectedAt, locale)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">{t("publicPages.forensics.noChanges")}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.key} className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{section.title}</CardTitle>
                <Badge variant="outline">{section.score}/100</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 py-5">
              {section.items.length > 0 ? (
                section.items.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-muted/15 p-3">
                    <div className="text-sm font-medium">{item.label}</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{item.sourceUrl}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  {t("publicPages.forensics.noEvidenceForSection")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/15 p-3">
      <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-medium">{value}</div>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-muted">
        <div className="h-full bg-foreground/75" style={{ width: `${Math.max(6, value)}%` }} />
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t pt-3 first:border-t-0 first:pt-0">
      <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm leading-6">{value}</div>
    </div>
  )
}
