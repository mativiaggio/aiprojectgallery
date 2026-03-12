import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ExternalLink, Github } from "lucide-react"

import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { ProjectEditForm } from "@/components/projects/project-edit-form"
import { ProjectImage } from "@/components/projects/project-image"
import { ProjectOwnershipPanel } from "@/components/projects/project-ownership-panel"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { RetryProjectButton } from "@/components/projects/retry-project-button"
import { LinkButton } from "@/components/link-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjectForOwner } from "@/lib/projects/service"
import { PROJECT_STATUS } from "@/lib/projects/types"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage project",
}

export default async function DashboardProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await requireSession()
  const { projectId } = await params
  const project = await getProjectForOwner(projectId, session.user.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className="py-0 shadow-none">
          <div className="border-b border-border/70">
            {project.screenshotUrl ? (
              <ProjectImage
                src={project.screenshotUrl}
                alt={`${project.name} screenshot`}
                className="w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-end bg-[linear-gradient(180deg,rgba(17,17,20,0),rgba(17,17,20,0.04))] p-5">
                <div className="rounded-md border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  Preview not ready yet
                </div>
              </div>
            )}
          </div>
          <CardHeader className="gap-4 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-3xl tracking-[-0.05em]">{project.name}</CardTitle>
                  {project.verified ? <ProjectVerifiedBadge /> : null}
                </div>
                <CardDescription className="max-w-3xl leading-7">
                  {project.shortDescription}
                </CardDescription>
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.processingError ? (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:text-amber-200">
                {project.processingError}
              </div>
            ) : null}
          </CardHeader>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Overview</CardTitle>
            <CardDescription>Open, retry, and review the public surface from one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <LinkButton href={project.appUrl} target="_blank" rel="noreferrer" size="sm">
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
            {project.status === PROJECT_STATUS.published ? (
              <LinkButton href={`/projects/${project.slug}`} variant="outline" size="sm">
                View public listing
              </LinkButton>
            ) : null}
            <RetryProjectButton projectId={project.id} />

            <div className="space-y-3 border-t pt-4 text-sm">
              <DetailRow label="Application URL" value={project.appUrl} />
              <DetailRow label="Repository URL" value={project.repositoryUrl ?? "Not provided"} />
              <DetailRow
                label="Screenshot captured"
                value={
                  project.screenshotCapturedAt
                    ? project.screenshotCapturedAt.toLocaleString()
                    : "Not captured yet"
                }
              />
              <DetailRow
                label="Published"
                value={project.publishedAt ? project.publishedAt.toLocaleString() : "Not yet"}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Edit project</CardTitle>
            <CardDescription>
              Update the public listing fields. URL changes restart screenshot capture automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <ProjectEditForm
              project={{
                id: project.id,
                name: project.name,
                shortDescription: project.shortDescription,
                appUrl: project.appUrl,
                repositoryUrl: project.repositoryUrl,
                aiTools: project.aiTools,
                tags: project.tags,
              }}
            />
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Ownership verification</CardTitle>
            <CardDescription>
              Prove control of the hostname with a meta tag. This stays optional and manual.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <ProjectOwnershipPanel
              projectId={project.id}
              initialState={{
                verified: project.verified,
                verificationToken: project.verificationToken,
                verificationMetaTag: project.verificationMetaTag,
                verifiedAt: project.verifiedAt?.toISOString() ?? null,
                verificationLastCheckedAt:
                  project.verificationLastCheckedAt?.toISOString() ?? null,
                verificationError: project.verificationError,
              }}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Delete removes the project record permanently. Failed verification does not block a
              future retry, but deletion cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t pt-3 first:border-t-0 first:pt-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="break-all font-medium leading-6">{value}</div>
    </div>
  )
}
