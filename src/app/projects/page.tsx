import { ButtonLink } from "@/components/button-link"
import { ProjectCard } from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { projects } from "@/lib/data"

export default function ProjectsPage() {
  const toolHeavyProjects = projects.filter((project) => project.tools.length >= 3)
  const editorialProjects = projects.filter((project) =>
    project.tags.some((tag) => ["Editorial UI", "Reports", "Marketing"].includes(tag))
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="max-w-3xl">
        <div className="mb-5 flex flex-wrap gap-2">
          {["Newest first", "Project pages", "Maker profiles"].map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="rounded-md bg-background px-2.5 py-1"
            >
              {item}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          The full gallery is already mapped out.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          This page works as the public catalog for AI-built products. It uses
          the same card system as the homepage, so data can move between both
          surfaces without needing a redesign later.
        </p>
      </div>

      <Tabs defaultValue="newest" className="mt-10 gap-6">
        <TabsList variant="line">
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="tool-heavy">Tool-rich</TabsTrigger>
          <TabsTrigger value="editorial">Editorial</TabsTrigger>
        </TabsList>

        <TabsContent value="newest">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tool-heavy">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {toolHeavyProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editorial">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {editorialProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 flex flex-col gap-4 rounded-xl border border-border/80 bg-card/85 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-medium">Ready to add your own build?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The submit flow is already designed around screenshot generation and
            UploadThing storage.
          </p>
        </div>
        <ButtonLink href="/submit">
          Go to submission form
        </ButtonLink>
      </div>
    </div>
  )
}
