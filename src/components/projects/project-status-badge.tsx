import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { PROJECT_STATUS, type ProjectStatus } from "@/lib/projects/types"

const statusMap: Record<
  ProjectStatus,
  {
    label: string
    variant: "outline" | "secondary"
    icon: typeof LoaderCircle
    className?: string
  }
> = {
  [PROJECT_STATUS.processing]: {
    label: "Processing",
    variant: "secondary",
    icon: LoaderCircle,
    className: "gap-1.5",
  },
  [PROJECT_STATUS.published]: {
    label: "Published",
    variant: "outline",
    icon: Sparkles,
    className: "gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  [PROJECT_STATUS.failed]: {
    label: "Needs attention",
    variant: "outline",
    icon: AlertTriangle,
    className: "gap-1.5 border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus | string }) {
  const normalizedStatus = (status in statusMap ? status : PROJECT_STATUS.processing) as ProjectStatus
  const config = statusMap[normalizedStatus]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon
        className={`size-3.5 ${normalizedStatus === PROJECT_STATUS.processing ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  )
}
