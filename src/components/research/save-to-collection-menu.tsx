"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookmarkPlus, Check, Loader2 } from "lucide-react"

import { LinkButton } from "@/components/link-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type CollectionSummary = {
  id: string
  name: string
  itemCount: number
  containsProject?: boolean
}

export function SaveToCollectionMenu({
  projectId,
}: {
  projectId: string
}) {
  const router = useRouter()
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    void fetch(`/api/collections?projectId=${projectId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.ok) {
          return
        }

        setCollections(payload.collections)
      })
      .catch(() => null)
  }, [projectId])

  function toggleCollection(collection: CollectionSummary) {
    setMessage(null)

    startTransition(() => {
      void fetch(
        collection.containsProject
          ? `/api/collections/${collection.id}/items?projectId=${projectId}`
          : `/api/collections/${collection.id}/items`,
        {
          method: collection.containsProject ? "DELETE" : "POST",
          headers: {
            "content-type": "application/json",
          },
          body: collection.containsProject
            ? undefined
            : JSON.stringify({
                projectId,
              }),
        }
      )
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as
            | { ok?: boolean; message?: string }
            | null

          return response.ok ? payload : { ok: false, message: payload?.message }
        })
        .then((payload) => {
          if (!payload?.ok) {
            setMessage(payload?.message ?? "Unable to save right now.")
            return
          }

          setCollections((currentCollections) =>
            currentCollections.map((entry) =>
              entry.id === collection.id
                ? {
                    ...entry,
                    containsProject: !collection.containsProject,
                    itemCount: Math.max(
                      0,
                      entry.itemCount + (collection.containsProject ? -1 : 1)
                    ),
                  }
                : entry
            )
          )
          setMessage(
            collection.containsProject
              ? "Removed from collection."
              : "Saved to collection."
          )
          router.refresh()
        })
        .catch(() => setMessage("Unable to save right now."))
    })
  }

  if (collections.length === 0) {
    return (
      <LinkButton href="/dashboard/collections" variant="outline" size="sm">
        <BookmarkPlus className="size-4" />
        Create collection
      </LinkButton>
    )
  }

  const savedCount = collections.filter((collection) => collection.containsProject).length

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <BookmarkPlus className="size-4" />}
          {savedCount > 0 ? `In ${savedCount} collection${savedCount === 1 ? "" : "s"}` : "Save to collection"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Your collections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => toggleCollection(collection)}
              >
                <span>{collection.name}</span>
                <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  {collection.containsProject ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : null}
                  {collection.itemCount}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {message ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="size-4" />
          {message}
        </div>
      ) : null}
    </div>
  )
}
