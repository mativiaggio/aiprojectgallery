"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ScanSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type AnalysisRunState = "queued" | "running" | "completed" | "failed" | null

export function AnalyzeProjectButton({
  projectId,
  initialStatus,
}: {
  projectId: string
  initialStatus?: AnalysisRunState
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<AnalysisRunState>(initialStatus ?? null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAnalyze() {
    setError(null)
    setMessage(null)

    startTransition(() => {
      void analyzeProject()
    })
  }

  async function analyzeProject() {
    const response = await fetch(`/api/projects/${projectId}/analyze`, {
      method: "POST",
    })

    const payload = (await response.json()) as {
      message?: string
      run?: {
        status?: AnalysisRunState
      }
    }

    if (!response.ok) {
      setError(payload.message ?? "Unable to refresh project analysis.")
      return
    }

    setStatus(payload.run?.status ?? "queued")
    setMessage(payload.message ?? "Deep analysis queued.")
    router.refresh()
  }

  const effectiveStatus = isPending ? "queued" : status
  const statusLabel = resolveStatusLabel(effectiveStatus)

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isPending || effectiveStatus === "running"}
        >
        <ScanSearch className={`size-4 ${isPending ? "animate-pulse" : ""}`} />
          {isPending
            ? "Queueing deep analysis..."
            : effectiveStatus === "running"
              ? "Analysis running..."
              : "Queue deep analysis"}
        </Button>
        {statusLabel ? <Badge variant="outline">{statusLabel}</Badge> : null}
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function resolveStatusLabel(status: AnalysisRunState) {
  switch (status) {
    case "queued":
      return "Queued"
    case "running":
      return "Running"
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    default:
      return null
  }
}
