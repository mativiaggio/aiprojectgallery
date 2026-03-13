import Link from "next/link"

import { RunAnalysisNowButton } from "@/components/projects/run-analysis-now-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ActiveRun = {
  id: string
  projectId: string
  status: string
  trigger: string
  queuedAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  errorMessage: string | null
  pagesAttempted: number
  pagesSucceeded: number
  snapshotId: string | null
  projectSlug: string
  projectName: string
  projectStatus: string
  nextPulseDueAt: Date | null
  lastAnalyzedAt: Date | null
  queuePosition: number
  estimatedStartAt: Date | null
}

type UpcomingProject = {
  id: string
  slug: string
  name: string
  status: string
  nextPulseDueAt: Date | null
  lastAnalyzedAt: Date | null
}

export function AnalysisQueuePanel({
  activeRuns,
  upcomingProjects,
}: {
  activeRuns: ActiveRun[]
  upcomingProjects: UpcomingProject[]
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
      <Card className="py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Analysis queue</CardTitle>
          <CardDescription>
            Live queue state across this workspace, including queue position, estimated start, and immediate execution controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-5">
          {activeRuns.length > 0 ? (
            activeRuns.map((run) => (
              <div key={run.id} className="grid gap-4 rounded-lg border bg-muted/15 p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/projects/${run.projectId}`} className="font-medium hover:underline">
                      {run.projectName}
                    </Link>
                    <Badge variant={run.status === "running" ? "secondary" : "outline"}>
                      {run.status}
                    </Badge>
                    <Badge variant="outline">{run.trigger}</Badge>
                    <Badge variant="outline">Queue #{run.queuePosition}</Badge>
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <div>Queued: {run.queuedAt.toLocaleString()}</div>
                    <div>
                      {run.status === "running"
                        ? `Started: ${run.startedAt?.toLocaleString() ?? "Unknown"}`
                        : `Estimated start: ${run.estimatedStartAt?.toLocaleString() ?? "Pending worker pickup"}`}
                    </div>
                    <div>
                      Next auto refresh: {run.nextPulseDueAt ? run.nextPulseDueAt.toLocaleString() : "Not scheduled"}
                    </div>
                    <div>
                      Last analyzed: {run.lastAnalyzedAt ? run.lastAnalyzedAt.toLocaleString() : "Not yet"}
                    </div>
                  </div>
                  {run.errorMessage ? (
                    <p className="text-sm text-destructive">{run.errorMessage}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="text-sm text-muted-foreground">
                    {run.pagesSucceeded > 0 || run.pagesAttempted > 0
                      ? `${run.pagesSucceeded}/${run.pagesAttempted} pages in latest execution`
                      : "Waiting for execution"}
                  </div>
                  <RunAnalysisNowButton projectId={run.projectId} disabled={run.status === "running"} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/10 px-4 py-5 text-sm leading-7 text-muted-foreground">
              There are no queued or running analysis jobs in this workspace right now.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Upcoming automatic runs</CardTitle>
          <CardDescription>Projects scheduled for their next pulse refresh.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-5">
          {upcomingProjects.length > 0 ? (
            upcomingProjects.map((project) => (
              <div key={project.id} className="rounded-lg border bg-muted/15 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline">
                    {project.name}
                  </Link>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Next automatic run: {project.nextPulseDueAt ? project.nextPulseDueAt.toLocaleString() : "Not scheduled"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Last analyzed: {project.lastAnalyzedAt ? project.lastAnalyzedAt.toLocaleString() : "Not yet"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              No upcoming automatic runs are currently scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
