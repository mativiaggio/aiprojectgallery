import type { Metadata } from "next"

import { DashboardProjectCard } from "@/components/projects/dashboard-project-card"
import { SubmissionWizard } from "@/components/projects/submission-wizard"
import { getUserProjects } from "@/lib/projects/service"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Submissions",
}

export default async function DashboardSubmissionsPage() {
  const session = await requireSession()
  const projects = await getUserProjects(session.user.id)
  const recentProjects = projects.slice(0, 2)

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-[-0.05em]">Submit a project</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Create the listing now, then let the platform generate and store the live preview in the
          background. You only need the public URL, a tight description, and the AI stack that powers the product.
        </p>
      </section>

      <SubmissionWizard />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Recent submissions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The most recent projects from your workspace, including anything still processing.
            </p>
          </div>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
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
