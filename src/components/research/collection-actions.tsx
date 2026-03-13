"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

export function CollectionActions({
  collectionId,
  isPublic,
  shareUrl,
}: {
  collectionId: string
  isPublic: boolean
  shareUrl: string
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleSharing() {
    setMessage(null)

    startTransition(() => {
      void fetch(`/api/collections/${collectionId}/share`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      })
        .then(() => window.location.reload())
        .catch(() => setMessage("Unable to update sharing."))
    })
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setMessage("Share link copied.")
    } catch {
      setMessage("Unable to copy share link.")
    }
  }

  function generateBrief() {
    setMessage(null)

    startTransition(() => {
      void fetch(`/api/collections/${collectionId}/brief`, {
        method: "POST",
      })
        .then(() => window.location.reload())
        .catch(() => setMessage("Unable to generate brief."))
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={toggleSharing} disabled={isPending}>
        {isPublic ? "Disable share link" : "Enable share link"}
      </Button>
      <Button type="button" variant="outline" onClick={copyShareLink} disabled={!isPublic}>
        Copy share link
      </Button>
      <Button type="button" onClick={generateBrief} disabled={isPending}>
        Generate brief
      </Button>
      {message ? <div className="basis-full text-sm text-muted-foreground">{message}</div> : null}
    </div>
  )
}
