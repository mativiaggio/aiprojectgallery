import { ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ProjectVerifiedBadge({
  label = "Verified",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
        className
      )}
    >
      <ShieldCheck className="size-3.5" />
      {label}
    </Badge>
  )
}
