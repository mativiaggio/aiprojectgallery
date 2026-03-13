"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RunAnalysisNowButton({
  projectId,
  disabled,
}: {
  projectId: string
  disabled?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRunNow() {
    setError(null)
    setMessage(null)

    startTransition(() => {
      void runNow()
    })
  }

  async function runNow() {
    const response = await fetch(`/api/projects/${projectId}/analyze/run-now`, {
      method: "POST",
    })

    const payload = (await response.json()) as { message?: string }

    if (!response.ok) {
      setError(payload.message ?? "Unable to run analysis right now.")
      return
    }

    setMessage(payload.message ?? "Analysis executed immediately.")
    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleRunNow}
        disabled={disabled || isPending}
      >
        <PlayCircle className={`size-4 ${isPending ? "animate-pulse" : ""}`} />
        {isPending ? "Running now..." : "Run now"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
