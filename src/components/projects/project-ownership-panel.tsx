"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { ProjectVerifiedBadge } from "@/components/projects/project-verified-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type OwnershipState = {
  verified: boolean
  verificationToken: string
  verificationMetaTag: string
  verifiedAt: string | null
  verificationLastCheckedAt: string | null
  verificationError: string | null
}

export function ProjectOwnershipPanel({
  projectId,
  initialState,
}: {
  projectId: string
  initialState: OwnershipState
}) {
  const router = useRouter()
  const [ownership, setOwnership] = useState(initialState)
  const [message, setMessage] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleVerify() {
    setMessage(null)

    startTransition(() => {
      void verifyOwnership()
    })
  }

  async function verifyOwnership() {
    const response = await fetch(`/api/projects/${projectId}/verify`, {
      method: "POST",
    })

    const payload = (await response.json()) as
      | {
          ok: true
          message: string
          ownership: OwnershipState
        }
      | {
          ok: false
          message: string
        }

    if (!response.ok || !payload.ok) {
      setMessage(payload.message)
      return
    }

    setOwnership(payload.ownership)
    setMessage(payload.message)
    router.refresh()
  }

  async function copyMetaTag() {
    try {
      await navigator.clipboard.writeText(ownership.verificationMetaTag)
      setCopyMessage("Meta tag copied.")
      window.setTimeout(() => setCopyMessage(null), 2_000)
    } catch {
      setCopyMessage("Unable to copy. Copy the tag manually.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {ownership.verified ? (
          <ProjectVerifiedBadge />
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Not verified
          </Badge>
        )}
        <Button type="button" variant="outline" onClick={handleVerify} disabled={isPending}>
          {isPending ? "Verifying..." : "Verify now"}
        </Button>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        Verification is optional and tied to the current hostname. Add this meta tag to the HTML of
        the submitted domain, then run a manual check.
      </p>

      <div className="rounded-lg border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Verification meta tag</div>
          <Button type="button" variant="outline" size="sm" onClick={copyMetaTag}>
            Copy tag
          </Button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md border bg-muted/20 p-3 text-xs leading-6 text-foreground">
          <code>{ownership.verificationMetaTag}</code>
        </pre>
        {copyMessage ? <p className="mt-2 text-sm text-muted-foreground">{copyMessage}</p> : null}
      </div>

      <div className="space-y-3 text-sm">
        <OwnershipRow label="Verification token" value={ownership.verificationToken} mono />
        <OwnershipRow
          label="Last checked"
          value={formatTimestamp(ownership.verificationLastCheckedAt)}
        />
        <OwnershipRow label="Verified at" value={formatTimestamp(ownership.verifiedAt)} />
      </div>

      {ownership.verificationError ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:text-amber-200">
          {ownership.verificationError}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {message}
        </div>
      ) : null}
    </div>
  )
}

function OwnershipRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="border-t pt-3 first:border-t-0 first:pt-0">
      <div className="text-muted-foreground">{label}</div>
      <div className={mono ? "mt-1 break-all font-mono text-xs" : "mt-1"}>{value}</div>
    </div>
  )
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not available yet"
  }

  return new Date(value).toLocaleString()
}
