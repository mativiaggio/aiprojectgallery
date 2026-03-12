import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink, Github, UserRound } from "lucide-react"

import { ProjectImage } from "@/components/projects/project-image"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPublishedProjectBySlug } from "@/lib/projects/service"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  if (!project) {
    return {
      title: "Project not found",
    }
  }

  return {
    title: project.name,
    description: project.shortDescription,
  }
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <Card className="overflow-hidden rounded-[1.5rem] py-0 shadow-none">
            <div className="border-b border-border/70">
              <ProjectImage
                src={project.screenshotUrl ?? ""}
                alt={`${project.name} screenshot`}
                className="w-full object-cover"
              />
            </div>
            <CardHeader className="gap-4 py-6">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full px-2.5">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-4xl tracking-[-0.06em]">{project.name}</CardTitle>
                  {project.verified ? (
                    <ProjectVerifiedBadge label="Verified Project" />
                  ) : null}
                </div>
                <CardDescription className="max-w-3xl text-base leading-8">
                  {project.shortDescription}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.5rem] py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>Project snapshot</CardTitle>
              <CardDescription>The metadata people need before they click through.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="size-4" />
                Submitted by {project.authorName}
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium">AI tools</div>
                <div className="flex flex-wrap gap-2">
                  {project.aiTools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="rounded-full px-2.5">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium">Links</div>
                <div className="flex flex-col items-start gap-2">
                  <LinkButton href={project.appUrl} target="_blank" rel="noreferrer" size="sm" animated>
                    Visit app
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
                      View repository
                      <Github data-icon="inline-end" />
                    </LinkButton>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <Card className="rounded-3xl py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>Why this listing exists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-6 text-sm leading-7 text-muted-foreground">
              <p>This submission is part of the gallery because it has a live public surface, a clear product story, and enough stack context to be genuinely useful.</p>
              <p>The preview is captured directly from the submitted URL so visitors can judge the launch quality before they leave the catalog.</p>
              <p>The AI tool stack and category tags stay close to the screenshot so comparison feels immediate instead of hidden behind a details panel.</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>Continue browsing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Back to gallery
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
