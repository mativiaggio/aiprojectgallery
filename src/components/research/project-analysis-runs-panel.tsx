import { RunAnalysisNowButton } from "@/components/projects/run-analysis-now-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"

type AnalysisRun = {
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
}

export async function ProjectAnalysisRunsPanel({
  projectId,
  nextPulseDueAt,
  runs,
}: {
  projectId: string
  nextPulseDueAt: Date | null
  runs: AnalysisRun[]
}) {
  const { locale, t } = await getI18n()

  return (
    <Card className="py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("dashboard.analysisRuns.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.analysisRuns.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-5">
        <div className="rounded-lg border bg-muted/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">{t("dashboard.analysisRuns.nextRun")}</div>
              <div className="text-muted-foreground">
                {nextPulseDueAt ? formatDateTime(nextPulseDueAt, locale) : t("common.notScheduled")}
              </div>
            </div>
            <RunAnalysisNowButton
              projectId={projectId}
              disabled={runs.some((run) => run.status === "running")}
            />
          </div>
        </div>

        {runs.length > 0 ? (
          <div className="space-y-3">
            {runs.map((run) => (
              <div key={run.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={run.status === "running" ? "secondary" : "outline"}>
                    {run.status}
                  </Badge>
                  <Badge variant="outline">{run.trigger}</Badge>
                  {run.snapshotId ? <Badge variant="outline">{t("dashboard.analysisRuns.snapshotLinked")}</Badge> : null}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <div>{t("dashboard.analysisRuns.queued")}: {formatDateTime(run.queuedAt, locale)}</div>
                  <div>{t("dashboard.analysisRuns.started")}: {run.startedAt ? formatDateTime(run.startedAt, locale) : t("dashboard.analysisRuns.notStarted")}</div>
                  <div>{t("dashboard.analysisRuns.finished")}: {run.finishedAt ? formatDateTime(run.finishedAt, locale) : t("dashboard.analysisRuns.notFinished")}</div>
                  <div>
                    {t("dashboard.analysisRuns.coverage")}: {run.pagesSucceeded}/{run.pagesAttempted} {t("dashboard.analysisRuns.pages")}
                  </div>
                </div>
                {run.errorMessage ? (
                  <p className="mt-3 text-sm text-destructive">{run.errorMessage}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/10 px-4 py-5 text-sm leading-7 text-muted-foreground">
            {t("dashboard.analysisRuns.empty")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
