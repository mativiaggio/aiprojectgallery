"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canDelete = confirmation.trim() === projectName

  function handleDelete() {
    setError(null)

    startTransition(() => {
      void deleteProject()
    })
  }

  async function deleteProject() {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    })

    const payload = (await response.json()) as { message?: string }

    if (!response.ok) {
      setError(payload.message ?? "Unable to delete this project.")
      return
    }

    router.push("/dashboard/projects")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Type <span className="font-medium text-foreground">{projectName}</span> to confirm the hard
        delete. This removes the database record and tries to clean up the uploaded screenshot.
      </p>

      <Input
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        placeholder={projectName}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={!canDelete || isPending}
        >
          {isPending ? "Deleting..." : "Delete project"}
        </Button>
        {!canDelete ? (
          <span className="text-sm text-muted-foreground">Confirmation must match the project name.</span>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
