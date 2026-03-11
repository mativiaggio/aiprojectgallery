import { notFound } from "next/navigation"

import { ProjectCard } from "@/components/project-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getProjectsByHandle, projects } from "@/lib/data"

export function generateStaticParams() {
  return Array.from(new Set(projects.map((project) => project.author.handle))).map(
    (handle) => ({
      handle,
    })
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const authorProjects = getProjectsByHandle(handle)

  if (authorProjects.length === 0) {
    notFound()
  }

  const author = authorProjects[0].author

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <Card className="border-border/80 bg-card/90">
        <CardContent className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{author.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em]">
                {author.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{author.handle} · {author.role}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                A public maker profile for contributors who keep shipping with
                AI. This page is already ready for Better Auth user ownership
                and project history later.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:w-auto">
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="mt-1 font-mono text-lg">{authorProjects.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saved across work</p>
              <p className="mt-1 font-mono text-lg">
                {authorProjects.reduce(
                  (total, project) => total + Number(project.stats.saves),
                  0
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="mt-10 gap-6">
        <TabsList variant="line">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="mb-6 flex flex-wrap gap-2">
            {["Repeat contributor", "Public profile", "Portfolio layer"].map(
              (item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="rounded-md bg-background px-2.5 py-1"
                >
                  {item}
                </Badge>
              )
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {authorProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/80 bg-card/90 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Recent publishing activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {authorProjects.map((project) => (
                  <div
                    key={project.slug}
                    className="rounded-lg border border-border/70 bg-background/80 p-4"
                  >
                    <p className="font-medium">{project.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Published on {project.createdAt} with {project.tools.join(", ")}.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="pb-2">
                <CardTitle>Profile focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Shows authorship clearly on every project.</p>
                <p>Creates room for badges, reputation, and future saved items.</p>
                <p>Lets the gallery feel community-led from the first release.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
