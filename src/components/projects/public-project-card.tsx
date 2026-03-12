import { ExternalLink, UserRound } from "lucide-react"

import { ProjectImage } from "@/components/projects/project-image"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PublicProjectCardProps = {
  project: {
    slug: string
    name: string
    shortDescription: string
    appUrl: string
    screenshotUrl: string | null
    aiTools: string[]
    tags: string[]
    authorName: string
    verified: boolean
  }
}

export function PublicProjectCard({ project }: PublicProjectCardProps) {
  return (
    <Card className="h-full rounded-[1.35rem] py-0 shadow-none">
      <div className="border-b border-border/70">
        {project.screenshotUrl ? (
          <ProjectImage
            src={project.screenshotUrl}
            alt={`${project.name} screenshot`}
            className="w-full object-cover"
          />
        ) : null}
      </div>

      <CardHeader className="gap-3 py-5">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full px-2.5">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl tracking-[-0.05em]">{project.name}</CardTitle>
          {project.verified ? <ProjectVerifiedBadge label="Verified Project" /> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        <p className="text-sm leading-7 text-muted-foreground">{project.shortDescription}</p>

        <div className="flex flex-wrap gap-2">
          {project.aiTools.map((tool) => (
            <Badge key={tool} variant="secondary" className="rounded-full px-2.5">
              {tool}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/30">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="size-4" />
          <span className="truncate">{project.authorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href={`/projects/${project.slug}`} variant="outline" size="sm">
            View details
          </LinkButton>
          <LinkButton href={project.appUrl} target="_blank" rel="noreferrer" size="sm" animated>
            Visit app
            <ExternalLink data-icon="inline-end" />
          </LinkButton>
        </div>
      </CardFooter>
    </Card>
  )
}
