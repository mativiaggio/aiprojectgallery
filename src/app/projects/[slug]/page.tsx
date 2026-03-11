import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, Github, Layers3 } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { ProjectCard } from "@/components/project-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getProjectBySlug, projects } from "@/lib/data"

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const relatedProjects = projects
    .filter((candidate) => candidate.slug !== project.slug)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="mb-10">
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to gallery
        </Link>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-md bg-background px-2.5 py-1"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
          {project.description}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-card/90">
          <CardContent className="pt-4">
            <div className="overflow-hidden rounded-lg border border-border/80 bg-secondary/30">
              <Image
                src={project.screenshotUrl}
                alt={project.name}
                width={1200}
                height={900}
                className="h-auto w-full"
                priority
              />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Tabs defaultValue="overview" className="gap-5">
              <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border/70 bg-background/80">
                    <CardHeader className="pb-2">
                      <CardTitle>What it does</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {project.tagline}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/80">
                    <CardHeader className="pb-2">
                      <CardTitle>Framework</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <Layers3 className="size-4 text-muted-foreground" />
                      <p className="text-sm">{project.framework}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tools">
                <div className="flex flex-wrap gap-3">
                  {project.tools.map((tool) => (
                    <Badge
                      key={tool}
                      className="rounded-md bg-secondary px-2.5 py-1"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="links">
                <div className="flex flex-col gap-3">
                  <Link
                    href={project.url}
                    className="text-sm text-foreground underline underline-offset-4"
                  >
                    {project.url}
                  </Link>
                  {project.githubUrl ? (
                    <Link
                      href={project.githubUrl}
                      className="text-sm text-foreground underline underline-offset-4"
                    >
                      {project.githubUrl}
                    </Link>
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle>Project details</CardTitle>
              <CardDescription>
                The final model can map directly to Prisma without changing the
                page layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{project.author.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{project.author.handle} · {project.author.role}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="mt-1 font-mono text-lg">{project.stats.saves}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="mt-1 font-mono text-lg">
                    {project.stats.comments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="mt-1 text-sm">{project.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="mt-1 text-sm">{project.framework}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={project.url}>
                  Visit live app
                  <ArrowUpRight className="size-4" />
                </ButtonLink>
                {project.githubUrl ? (
                  <ButtonLink
                    href={project.githubUrl}
                    variant="outline"
                  >
                    GitHub
                    <Github className="size-4" />
                  </ButtonLink>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle>More from this maker</CardTitle>
              <CardDescription>
                Profiles work as lightweight portfolios inside the gallery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLink
                href={`/profile/${project.author.handle}`}
                variant="outline"
              >
                Open profile
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-16">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            Similar projects
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Related work keeps discovery moving without changing context.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProjects.map((relatedProject) => (
            <ProjectCard key={relatedProject.slug} project={relatedProject} />
          ))}
        </div>
      </section>
    </div>
  )
}
