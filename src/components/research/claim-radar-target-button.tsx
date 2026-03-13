"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Radar } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ClaimRadarTargetButton({ targetId }: { targetId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClaim() {
    setError(null)

    startTransition(() => {
      void claimTarget()
    })
  }

  async function claimTarget() {
    const response = await fetch(`/api/radar/${targetId}/claim`, {
      method: "POST",
    })

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; projectId?: string; message?: string }
      | null

    if (!response.ok || !payload?.ok || !payload.projectId) {
      setError(payload?.message ?? "Unable to claim this product right now.")
      return
    }

    router.push(`/dashboard/projects/${payload.projectId}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleClaim} disabled={isPending}>
        <Radar className="size-4" />
        {isPending ? "Claiming..." : "Claim this product"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
