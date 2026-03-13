"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CreateCollectionForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setMessage(null)

    startTransition(() => {
      void fetch("/api/collections", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as {
            ok: boolean
            collectionId?: string
            message?: string
          }

          if (!response.ok || !payload.ok || !payload.collectionId) {
            setMessage(payload.message ?? "Unable to create collection.")
            return
          }

          router.push(`/dashboard/collections/${payload.collectionId}`)
          router.refresh()
        })
        .catch(() => setMessage("Unable to create collection."))
    })
  }

  return (
    <div className="space-y-4">
      <FieldGroup className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="collection-name">Collection name</FieldLabel>
          <Input
            id="collection-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="AI coding tools"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="collection-description">Description</FieldLabel>
          <Textarea
            id="collection-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="What are you tracking in this set?"
          />
        </Field>
      </FieldGroup>
      {message ? <div className="text-sm text-destructive">{message}</div> : null}
      <Button type="button" onClick={handleSubmit} disabled={isPending || name.trim().length < 2}>
        {isPending ? "Creating..." : "Create collection"}
      </Button>
    </div>
  )
}
