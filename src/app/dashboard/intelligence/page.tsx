import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/link-button"
import { getDashboardResearchCorpus } from "@/lib/dashboard/intelligence"
import { requireDashboardContext } from "@/lib/organizations/service"
import { getOrganizationProjects } from "@/lib/projects/service"

export const metadata: Metadata = {
  title: "Intelligence",
}

export default async function DashboardIntelligencePage() {
  const context = await requireDashboardContext("/dashboard/intelligence")
  const [corpus, projects] = await Promise.all([
    getDashboardResearchCorpus(),
    getOrganizationProjects({
      organizationId: context.activeOrganization.id,
      role: context.activeMember.role,
      userId: context.session.user.id,
    }),
  ])

  const dossierReadyProjects = projects.filter((project) => project.lastAnalyzedAt)
  const needsRefresh = projects.filter((project) => !project.lastAnalyzedAt)

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">Intelligence</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Private research modules for AI system breakdowns, capability mapping, and market
            movement tracking. The public site stays lightweight; the heavier analytical read lives
            here.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border bg-card">
          <StatRow label="Published corpus" value={corpus.projects.length} />
          <StatRow label="Workspace dossiers ready" value={dossierReadyProjects.length} />
          <StatRow label="Needs refresh" value={needsRefresh.length} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          title="AI system dossier"
          description="Per-project architecture hypotheses, capability genome, benchmark proxies, and evidence-backed claims."
          href={projects[0] ? `/dashboard/projects/${projects[0].id}` : "/dashboard/projects"}
        />
        <ModuleCard
          title="Capability genome"
          description="A matrix of atomic AI capabilities across the tracked product corpus."
          href="/dashboard/genome"
        />
        <ModuleCard
          title="Category time machine"
          description="A category-level view of docs, pricing, and onboarding posture over time."
          href="/dashboard/time-machine"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Workspace dossier roster</CardTitle>
            <CardDescription>
              Jump into project-level dossiers from the active organization workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-5">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="rounded-lg border bg-muted/15 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <Link href={`/dashboard/projects/${project.id}`} className="text-sm font-medium hover:underline">
                        {project.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">{project.shortDescription}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{project.status}</Badge>
                      <Badge variant="secondary">Credibility {project.credibilityScore}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Last analyzed{" "}
                      {project.lastAnalyzedAt ? project.lastAnalyzedAt.toLocaleString() : "not yet"}
                    </span>
                    <span>{project.featureGapCount} tracked recommendations</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Your active organization does not have projects yet. Create a submission to start a dossier.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Capability hotspots</CardTitle>
            <CardDescription>
              The most visible system patterns across the published AI product corpus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-5">
            {corpus.capabilityFrequency.slice(0, 6).map((capability) => (
              <div key={capability.key} className="rounded-lg border bg-muted/15 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{capability.label}</div>
                  <Badge variant="outline">{capability.projectCount}</Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Average confidence {capability.averageConfidence}%
                </div>
              </div>
            ))}
            <div className="pt-2">
              <LinkButton href="/dashboard/genome" variant="outline" size="sm">
                Open genome matrix
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b px-5 py-5 last:border-b-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{value}</div>
    </div>
  )
}

function ModuleCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full py-0 shadow-none transition-colors hover:bg-muted/20">
        <CardHeader className="border-b py-5">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-5 text-sm leading-7 text-muted-foreground">
          {description}
        </CardContent>
      </Card>
    </Link>
  )
}
