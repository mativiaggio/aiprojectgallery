"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RemoveFromCollectionButton({
  collectionId,
  projectId,
}: {
  collectionId: string
  projectId: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    setError(null)

    startTransition(() => {
      void removeProject()
    })
  }

  async function removeProject() {
    const response = await fetch(
      `/api/collections/${collectionId}/items?projectId=${projectId}`,
      {
        method: "DELETE",
      }
    )

    const payload = (await response.json()) as { message?: string }

    if (!response.ok) {
      setError(payload.message ?? "Unable to remove project from collection.")
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isPending}>
        <Trash2 className="size-4" />
        {isPending ? "Removing..." : "Remove"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
