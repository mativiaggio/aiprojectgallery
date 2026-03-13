import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardGenomeProject } from "@/lib/dashboard/intelligence"

export function CapabilityGenomeMatrix({
  projects,
  capabilityColumns,
}: {
  projects: DashboardGenomeProject[]
  capabilityColumns: Array<{
    key: string
    label: string
    projectCount: number
    averageConfidence: number
  }>
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {capabilityColumns.slice(0, 4).map((capability) => (
          <Card key={capability.key} className="py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle>{capability.label}</CardTitle>
              <CardDescription>{capability.projectCount} projects</CardDescription>
            </CardHeader>
            <CardContent className="py-4 text-sm text-muted-foreground">
              Average confidence {capability.averageConfidence}%
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Capability genome matrix</CardTitle>
          <CardDescription>
            Each row is a published product. Each column is an atomic AI capability inferred from the
            current public surface.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto py-0">
          <div className="min-w-[1080px]">
            <div className="grid grid-cols-[260px_repeat(10,88px)_100px] gap-3 border-b px-4 py-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <div>Project</div>
              {capabilityColumns.map((capability) => (
                <div key={capability.key} className="text-center">
                  {capability.label}
                </div>
              ))}
              <div className="text-right">Active</div>
            </div>
            <div className="divide-y">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-[260px_repeat(10,88px)_100px] gap-3 px-4 py-4"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{project.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {project.primaryUseCase ? <Badge variant="outline">{project.primaryUseCase}</Badge> : null}
                      {project.buyerType ? <Badge variant="outline">{project.buyerType}</Badge> : null}
                    </div>
                  </div>
                  {capabilityColumns.map((capability) => {
                    const value = project.capabilities.find((entry) => entry.key === capability.key)
                    const tone =
                      (value?.confidence ?? 0) >= 72
                        ? "bg-primary/90"
                        : (value?.confidence ?? 0) >= 55
                          ? "bg-foreground/70"
                          : (value?.confidence ?? 0) >= 38
                            ? "bg-muted-foreground/60"
                            : "bg-border"

                    return (
                      <div key={capability.key} className="flex flex-col items-center justify-center gap-2">
                        <div className={`h-2.5 w-12 rounded-full ${tone}`} />
                        <div className="text-xs text-muted-foreground">{value?.confidence ?? 0}%</div>
                      </div>
                    )
                  })}
                  <div className="text-right text-sm font-medium">{project.capabilityCount}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
