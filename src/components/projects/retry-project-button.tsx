"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RetryProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRetry() {
    setError(null)

    startTransition(() => {
      void retryProject()
    })
  }

  async function retryProject() {
    const response = await fetch(`/api/projects/${projectId}/retry`, {
      method: "POST",
    })

    const payload = (await response.json()) as { message?: string }

    if (!response.ok) {
      setError(payload.message ?? "Unable to retry screenshot generation.")
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleRetry} disabled={isPending}>
        <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Retrying..." : "Retry screenshot"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
