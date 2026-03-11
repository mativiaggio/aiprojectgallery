import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Project } from "@/lib/data"

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full border-border/80 bg-card/90 shadow-none">
      <CardContent className="pt-4">
        <div className="overflow-hidden rounded-lg border border-border/80 bg-secondary/30">
          <Image
            src={project.screenshotUrl}
            alt={project.name}
            width={1200}
            height={900}
            className="h-auto w-full"
          />
        </div>
      </CardContent>
      <CardHeader className="pb-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-md bg-background px-2 py-0.5 text-[11px]"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="leading-6">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <Badge
              key={tool}
              className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              {tool}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3 border-t border-border/70 bg-transparent">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{project.author.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{project.author.name}</p>
            <p className="text-xs text-muted-foreground">{project.createdAt}</p>
          </div>
        </div>
        <ButtonLink
          href={`/projects/${project.slug}`}
          variant="outline"
        >
          View
          <ArrowUpRight className="size-4" />
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
