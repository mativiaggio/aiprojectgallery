import { ExternalLink, Github } from "lucide-react"

import { LinkButton } from "@/components/link-button"
import { ProjectImage } from "@/components/projects/project-image"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { RemoveFromCollectionButton } from "@/components/research/remove-from-collection-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PROJECT_STATUS } from "@/lib/projects/types"

type DashboardCollectionItemCardProps = {
  collectionId: string
  item: {
    id: string
    slug: string
    name: string
    shortDescription: string
    researchSummary: string | null
    appUrl: string
    repositoryUrl: string | null
    screenshotUrl: string | null
    status: string
    note: string | null
    verified: boolean
    featureGapCount: number
    featureGapSummary: {
      title: string
      impact: string
      confidence: number
    } | null
    analysisPending: boolean
  }
}

export function DashboardCollectionItemCard({
  collectionId,
  item,
}: DashboardCollectionItemCardProps) {
  return (
    <Card className="h-full py-0 shadow-none">
      {item.screenshotUrl ? (
        <ProjectImage
          src={item.screenshotUrl}
          alt={`${item.name} screenshot`}
          className="w-full border-b object-cover"
        />
      ) : (
        <div className="flex aspect-video items-end border-b bg-[linear-gradient(180deg,rgba(17,17,20,0),rgba(17,17,20,0.04))] p-4">
          <div className="rounded-md border border-border/70 bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
            Preview pending
          </div>
        </div>
      )}

      <CardHeader className="gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <ProjectStatusBadge status={item.status} />
              {item.analysisPending ? (
                <Badge variant="outline">Analysis pending</Badge>
              ) : null}
              {item.featureGapSummary ? (
                <Badge variant="secondary">{item.featureGapSummary.title}</Badge>
              ) : null}
            </div>
            <CardTitle className="text-lg tracking-[-0.03em]">{item.name}</CardTitle>
          </div>
          {item.verified ? <ProjectVerifiedBadge label="Verified" /> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <p className="text-sm leading-7 text-muted-foreground">
          {item.note?.trim() || item.researchSummary || item.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{item.featureGapCount} tracked recommendation{item.featureGapCount === 1 ? "" : "s"}</span>
          {item.featureGapSummary ? (
            <span>
              {item.featureGapSummary.impact} impact at {item.featureGapSummary.confidence}% confidence
            </span>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-2 border-t bg-muted/25">
        <LinkButton href={`/dashboard/projects/${item.id}`} variant="outline" size="sm">
          Manage submission
        </LinkButton>
        {item.status === PROJECT_STATUS.published ? (
          <LinkButton href={`/projects/${item.slug}`} variant="outline" size="sm">
            View research
          </LinkButton>
        ) : null}
        <LinkButton href={item.appUrl} size="sm" animated>
          Open app
          <ExternalLink data-icon="inline-end" />
        </LinkButton>
        {item.repositoryUrl ? (
          <LinkButton href={item.repositoryUrl} variant="outline" size="sm" target="_blank" rel="noreferrer">
            Repo
            <Github data-icon="inline-end" />
          </LinkButton>
        ) : null}
        <RemoveFromCollectionButton collectionId={collectionId} projectId={item.id} />
      </CardFooter>
    </Card>
  )
}
