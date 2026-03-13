"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function RadarSubmitForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    startTransition(() => {
      void submitTarget()
    })
  }

  async function submitTarget() {
    const response = await fetch("/api/radar", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        appUrl: url,
      }),
    })

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string; slug?: string }
      | null

    if (!response.ok || !payload?.ok) {
      setError(payload?.message ?? "Unable to add this target to radar.")
      return
    }

    setUrl("")
    setMessage(payload.message ?? "Target added to radar.")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://example.ai"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isPending || url.trim().length === 0}>
          {isPending ? "Adding..." : "Add to radar"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  )
}
