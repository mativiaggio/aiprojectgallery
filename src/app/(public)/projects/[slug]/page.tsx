import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink, Github } from "lucide-react"

import { SaveToCollectionMenu } from "@/components/research/save-to-collection-menu"
import { ProjectForensicsReport } from "@/components/research/project-forensics-report"
import { ProjectImage } from "@/components/projects/project-image"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/i18n/format"
import { translateFields } from "@/lib/i18n/dynamic-translation"
import { getI18n } from "@/lib/i18n/server"
import {
  getProjectForensics,
  getProjectPeers,
  getProjectStrategyTimeline,
  getProjectTimeline,
  getResearchProjectBySlug,
} from "@/lib/research/service"
import { getSession } from "@/lib/session"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getResearchProjectBySlug(slug)
  const { locale, t } = await getI18n()

  if (!project) {
    return {
      title: t("publicPages.publicProject.notFound"),
    }
  }

  const translated = await translateFields({
    entityType: "project-metadata",
    entityId: project.id,
    locale,
    fields: {
      description: project.researchSummary ?? project.shortDescription,
    },
  })

  return {
    title: project.name,
    description: translated.description ?? project.researchSummary ?? project.shortDescription,
  }
}

export default async function PublicProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { locale, t } = await getI18n()
  const { slug } = await params
  const { view = "overview" } = await searchParams
  const project = await getResearchProjectBySlug(slug)
  const session = await getSession()

  if (!project) {
    notFound()
  }

  const [peers, timeline, strategy, forensics] = await Promise.all([
    getProjectPeers(project.id),
    getProjectTimeline(project.id),
    getProjectStrategyTimeline(project.id),
    getProjectForensics(project.id),
  ])
  const projectCopy = await translateFields({
    entityType: "public-project",
    entityId: project.id,
    locale,
    fields: {
      summary: project.researchSummary ?? project.shortDescription,
      credibilitySummary: project.credibilitySummary,
      likelyIcp: project.likelyIcp,
    },
  })
  const translatedTimeline = await Promise.all(
    timeline.map(async (change) => {
      const translated = await translateFields({
        entityType: "project-change",
        entityId: change.id,
        locale,
        fields: { title: change.title, detail: change.detail },
      })

      return {
        ...change,
        title: translated.title ?? change.title,
        detail: translated.detail ?? change.detail,
      }
    })
  )
  const translatedStrategy = await Promise.all(
    strategy.map(async (event) => {
      const translated = await translateFields({
        entityType: "strategy-event",
        entityId: event.id,
        locale,
        fields: { title: event.title, detail: event.detail },
      })

      return {
        ...event,
        title: translated.title ?? event.title,
        detail: translated.detail ?? event.detail,
      }
    })
  )
  const translatedPeers = await Promise.all(
    peers.map(async (peer) => {
      const translated = await translateFields({
        entityType: "project-peer",
        entityId: `${project.id}:${peer.id}`,
        locale,
        fields: { rationale: peer.rationale },
      })

      return {
        ...peer,
        rationale: translated.rationale ?? peer.rationale,
      }
    })
  )

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <Card className="overflow-hidden py-0 shadow-none">
            {project.screenshotUrl ? (
              <ProjectImage
                src={project.screenshotUrl}
                alt={`${project.name} screenshot`}
                className="w-full border-b object-cover"
              />
            ) : null}
            <CardHeader className="gap-4 py-5">
              <div className="flex flex-wrap gap-2">
                {project.primaryUseCase ? <Badge variant="outline">{project.primaryUseCase}</Badge> : null}
                {project.buyerType ? <Badge variant="outline">{project.buyerType}</Badge> : null}
                {project.interactionModel ? <Badge variant="outline">{project.interactionModel}</Badge> : null}
                {project.pricingVisibility ? (
                  <Badge variant="outline">{project.pricingVisibility}</Badge>
                ) : null}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-4xl tracking-[-0.06em]">{project.name}</CardTitle>
                  {project.verified ? <ProjectVerifiedBadge label={t("publicPages.publicProject.verifiedProject")} /> : null}
                  <Badge variant="secondary">{t("publicPages.publicProject.credibility")} {project.credibilityScore}</Badge>
                </div>
                <p className="max-w-4xl text-base leading-8 text-muted-foreground">
                  {projectCopy.summary ?? project.researchSummary ?? project.shortDescription}
                </p>
              </div>
            </CardHeader>
          </Card>

          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>{t("publicPages.publicProject.researchProfile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 py-5">
              <DetailRow label={t("publicPages.publicProject.credibilitySummary")} value={projectCopy.credibilitySummary || t("common.noSummaryYet")} />
              <DetailRow label={t("publicPages.publicProject.likelyIcp")} value={projectCopy.likelyIcp || t("common.unknown")} />
              <DetailRow label={t("publicPages.publicProject.modelMix")} value={project.modelVendorMix || t("common.unknown")} />
              <DetailRow
                label={t("publicPages.publicProject.observedSignals")}
                value={[
                  project.pricingPageDetected ? "pricing" : null,
                  project.docsDetected ? "docs" : null,
                  project.demoCtaDetected ? "demo CTA" : null,
                  project.authWallDetected ? "auth wall" : null,
                ].filter(Boolean).join(", ") || t("common.noStrongSignalYet")}
              />
              <div className="flex flex-wrap gap-2">
                <LinkButton href={project.appUrl} size="sm" animated>
                  {t("publicPages.publicProject.visitApp")}
                  <ExternalLink data-icon="inline-end" />
                </LinkButton>
                {project.repositoryUrl ? (
                  <LinkButton href={project.repositoryUrl} variant="outline" size="sm">
                    {t("publicPages.publicProject.viewRepository")}
                    <Github data-icon="inline-end" />
                  </LinkButton>
                ) : null}
              </div>
              {session ? <SaveToCollectionMenu projectId={project.id} /> : null}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-wrap gap-2 border-b pb-4">
          <ViewLink slug={project.slug} label={t("publicPages.publicProject.overview")} current={view} value="overview" />
          <ViewLink slug={project.slug} label={t("publicPages.publicProject.forensics")} current={view} value="forensics" />
          <ViewLink slug={project.slug} label={t("publicPages.publicProject.timeline")} current={view} value="timeline" />
          <ViewLink slug={project.slug} label={t("publicPages.publicProject.strategy")} current={view} value="strategy" />
        </section>

        {view === "forensics" ? (
          <ProjectForensicsReport
            project={{
              executiveAbstract: project.executiveAbstract,
              forensicSummary: project.forensicSummary,
              methodologyNote: project.methodologyNote,
              coverageScore: project.coverageScore,
              pagesVisited: project.pagesVisited,
              confidenceScore: project.confidenceScore,
              marketClarityScore: project.marketClarityScore,
              conversionScore: project.conversionScore,
              trustScore: project.trustScore,
              technicalDepthScore: project.technicalDepthScore,
              proofScore: project.proofScore,
              freshnessScore: project.freshnessScore,
              evidenceSnippets: project.evidenceSnippets,
            }}
            forensics={forensics}
            changes={translatedTimeline}
          />
        ) : view === "timeline" ? (
          <section className="space-y-4">
            {translatedTimeline.map((change) => (
              <Card key={change.id} className="py-0 shadow-none">
                <CardHeader className="border-b py-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{change.title}</CardTitle>
                    <Badge variant="outline">{change.impact}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-4 text-sm leading-7 text-muted-foreground">
                  <p>{change.detail}</p>
                  <p className="mt-3">{formatDateTime(change.detectedAt, locale)}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : view === "strategy" ? (
          <section className="space-y-4">
            {translatedStrategy.length > 0 ? (
              translatedStrategy.map((event) => (
                <Card key={event.id} className="py-0 shadow-none">
                  <CardHeader className="border-b py-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{event.title}</CardTitle>
                      <Badge variant="outline">{event.impact}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 text-sm leading-7 text-muted-foreground">
                    <p>{event.detail}</p>
                    <p className="mt-3">{formatDateTime(event.detectedAt, locale)}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="py-0 shadow-none">
                <CardContent className="py-5 text-sm leading-7 text-muted-foreground">
                  {t("publicPages.publicProject.strategyEmpty")}
                </CardContent>
              </Card>
            )}
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="py-0 shadow-none">
              <CardHeader className="border-b py-5">
                <CardTitle>{t("publicPages.publicProject.closestCompetitors")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-5">
                {translatedPeers.map((peer) => (
                  <div key={peer.id} className="rounded-md border bg-muted/20 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/projects/${peer.slug}`} className="font-medium hover:underline">
                        {peer.name}
                      </Link>
                      <Badge variant="outline">{peer.similarityScore}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {peer.rationale}
                    </p>
                    <div className="mt-3">
                      <LinkButton href={`/compare?ids=${project.id},${peer.id}`} variant="outline" size="sm">
                        {t("publicPages.publicProject.compare")}
                      </LinkButton>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="py-0 shadow-none">
              <CardHeader className="border-b py-5">
                <CardTitle>{t("publicPages.publicProject.stackAndDiscovery")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <div className="flex flex-wrap gap-2">
                  {project.aiTools.map((tool) => (
                    <Badge key={tool} variant="secondary">
                      {tool}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}

function ViewLink({
  slug,
  label,
  value,
  current,
}: {
  slug: string
  label: string
  value: string
  current: string
}) {
  return (
    <LinkButton
      href={`/projects/${slug}?view=${value}`}
      variant={current === value ? "default" : "outline"}
      size="sm"
    >
      {label}
    </LinkButton>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t pt-3 first:border-t-0 first:pt-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium leading-6">{value}</div>
    </div>
  )
}
