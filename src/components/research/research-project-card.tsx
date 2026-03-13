import { ExternalLink, GitCompareArrows } from "lucide-react"

import { translateFields } from "@/lib/i18n/dynamic-translation"
import { getI18n } from "@/lib/i18n/server"
import { SaveToCollectionMenu } from "@/components/research/save-to-collection-menu"
import { ProjectImage } from "@/components/projects/project-image"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type ResearchProjectCardProps = {
  project: {
    id: string
    slug: string
    name: string
    shortDescription: string
    screenshotUrl: string | null
    appUrl: string
    aiTools: string[]
    tags: string[]
    primaryUseCase: string | null
    buyerType: string | null
    pricingVisibility: string | null
    credibilityScore: number
    credibilitySummary: string | null
    verified: boolean
    researchSummary: string | null
    topPeer?: {
      id: string
      slug: string
      name: string
      similarityScore: number
    } | null
  }
  allowSave?: boolean
}

export function ResearchProjectCard({
  project,
  allowSave = false,
}: ResearchProjectCardProps) {
  return <ResearchProjectCardContent project={project} allowSave={allowSave} />
}

async function ResearchProjectCardContent({
  project,
  allowSave,
}: ResearchProjectCardProps) {
  const { locale, t } = await getI18n()
  const translated = await translateFields({
    entityType: "research-card",
    entityId: project.id,
    locale,
    fields: {
      summary: project.researchSummary ?? project.shortDescription,
    },
  })

  return (
    <Card className="h-full py-0 shadow-none">
      {project.screenshotUrl ? (
        <ProjectImage
          src={project.screenshotUrl}
          alt={`${project.name} screenshot`}
          className="w-full border-b object-cover"
        />
      ) : null}
      <CardHeader className="gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {project.primaryUseCase ? <Badge variant="outline">{project.primaryUseCase}</Badge> : null}
              {project.buyerType ? <Badge variant="outline">{project.buyerType}</Badge> : null}
              {project.pricingVisibility ? (
                <Badge variant="outline">{project.pricingVisibility}</Badge>
              ) : null}
            </div>
            <CardTitle className="text-lg tracking-[-0.03em]">{project.name}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-2">
            {project.verified ? <ProjectVerifiedBadge label={t("publicPages.researchCard.verified")} /> : null}
            <div className="text-sm font-medium">{project.credibilityScore}/100</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <p className="text-sm leading-7 text-muted-foreground">
          {translated.summary ?? project.researchSummary ?? project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.aiTools.slice(0, 4).map((tool) => (
            <Badge key={tool} variant="secondary">
              {tool}
            </Badge>
          ))}
        </div>
        {project.topPeer ? (
          <div className="rounded-md border bg-muted/25 px-3 py-3 text-sm">
            {t("publicPages.researchCard.closestPeer")}: {project.topPeer.name} ({project.topPeer.similarityScore})
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 border-t bg-muted/30">
        <LinkButton href={`/projects/${project.slug}`} variant="outline" size="sm">
          {t("publicPages.researchCard.openResearch")}
        </LinkButton>
        {project.topPeer ? (
          <LinkButton
            href={`/compare?ids=${project.id},${project.topPeer.id}`}
            variant="outline"
            size="sm"
          >
            Compare
            <GitCompareArrows data-icon="inline-end" />
          </LinkButton>
        ) : null}
        <LinkButton href={project.appUrl} size="sm" animated>
          {t("common.visitApp")}
          <ExternalLink data-icon="inline-end" />
        </LinkButton>
        {allowSave ? <SaveToCollectionMenu projectId={project.id} /> : null}
      </CardFooter>
    </Card>
  )
}
