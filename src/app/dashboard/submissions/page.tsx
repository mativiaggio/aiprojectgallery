import type { Metadata } from "next"

import { DashboardProjectCard } from "@/components/projects/dashboard-project-card"
import { SubmissionWizard } from "@/components/projects/submission-wizard"
import { getOrganizationProjects } from "@/lib/projects/service"
import { requireDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Submissions",
}

export default async function DashboardSubmissionsPage() {
  const context = await requireDashboardContext("/dashboard/submissions")
  const projects = await getOrganizationProjects({
    organizationId: context.activeOrganization.id,
    userId: context.session.user.id,
    role: context.activeMember.role,
  })
  const recentProjects = projects.slice(0, 2)

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-[-0.05em]">Submit a project</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Create the listing now, then let the platform generate and store the live preview in the
          background. You only need the public URL, a tight description, and the AI stack that powers the product.
        </p>
        <p className="text-sm text-muted-foreground">
          New submissions are created inside {context.activeOrganization.name}.
        </p>
      </section>

      <SubmissionWizard />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Recent submissions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The most recent projects from {context.activeOrganization.name}, including anything still processing.
            </p>
          </div>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {recentProjects.map((project) => (
              <DashboardProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-dashed bg-muted/15 px-5 py-8 text-sm leading-6 text-muted-foreground">
            Your first submission will show up here as soon as it is created.
          </div>
        )}
      </section>
    </div>
  )
}
