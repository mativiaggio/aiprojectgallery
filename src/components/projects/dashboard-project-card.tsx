import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"

import { ProjectImage } from "@/components/projects/project-image"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/link-button"
import { PROJECT_STATUS } from "@/lib/projects/types"

type DashboardProjectCardProps = {
  project: {
    id: string
    slug: string
    name: string
    appUrl: string
    repositoryUrl: string | null
    status: string
    screenshotUrl: string | null
    verified: boolean
  }
}

export function DashboardProjectCard({ project }: DashboardProjectCardProps) {
  const statusChip =
    project.status === PROJECT_STATUS.processing
      ? "Processing"
      : project.status === PROJECT_STATUS.failed
        ? "Needs attention"
        : null

  return (
    <Card className="h-full py-0 shadow-none">
      <div className="relative border-b border-border/70">
        {project.screenshotUrl ? (
          <ProjectImage
            src={project.screenshotUrl}
            alt={`${project.name} screenshot`}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] items-end bg-[linear-gradient(180deg,rgba(17,17,20,0),rgba(17,17,20,0.04))] p-4">
            <div className="rounded-md border border-border/70 bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
              Preview pending
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {statusChip ? (
            <Badge
              variant="outline"
              className={
                project.status === PROJECT_STATUS.failed
                  ? "border-amber-500/25 bg-background/95 text-amber-800 backdrop-blur dark:text-amber-300"
                  : "bg-background/95 text-foreground backdrop-blur"
              }
            >
              {statusChip}
            </Badge>
          ) : (
            <span />
          )}

          {project.verified ? (
            <ProjectVerifiedBadge className="bg-background/95 backdrop-blur" />
          ) : null}
        </div>
      </div>

      <CardHeader className="py-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg tracking-[-0.03em]">{project.name}</CardTitle>
          {!project.verified && project.status === PROJECT_STATUS.published ? (
            <Badge variant="outline" className="text-muted-foreground">
              Live
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-card">
        <div className="flex flex-wrap items-center gap-2">
          <LinkButton href={`/dashboard/projects/${project.id}`} size="sm">
            Manage
          </LinkButton>
          <LinkButton
            href={project.appUrl}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            size="sm"
          >
            Open app
            <ExternalLink data-icon="inline-end" />
          </LinkButton>
          {project.repositoryUrl ? (
            <LinkButton
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
            >
              Open repo
              <Github data-icon="inline-end" />
            </LinkButton>
          ) : null}
        </div>

        {project.status === PROJECT_STATUS.published ? (
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View listing
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Open details to manage this project.</span>
        )}
      </CardFooter>
    </Card>
  )
}
