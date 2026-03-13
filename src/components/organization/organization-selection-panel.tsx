"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type OrganizationSelectionPanelProps = {
  autoOrganizationId?: string
  nextPath: string
  organizations: Array<{
    id: string
    name: string
    slug: string
    memberRole: string
  }>
  invitations: Array<{
    id: string
    organizationName: string
    inviterName: string
    email: string
    role: string | null
    expiresAt: string
  }>
}

export function OrganizationSelectionPanel({
  autoOrganizationId,
  nextPath,
  organizations,
  invitations,
}: OrganizationSelectionPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function setActiveOrganization(organizationId: string) {
    setError(null)

    startTransition(() => {
      void authClient
        .$fetch("/organization/set-active", {
          method: "POST",
          body: {
            organizationId,
          },
        })
        .then(() => {
          router.replace(nextPath)
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to switch organization."
          )
        })
    })
  }

  function rejectInvitation(invitationId: string) {
    setError(null)

    startTransition(() => {
      void authClient
        .$fetch("/organization/reject-invitation", {
          method: "POST",
          body: {
            invitationId,
          },
        })
        .then(() => {
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to reject invitation."
          )
        })
    })
  }

  useEffect(() => {
    if (!autoOrganizationId) {
      return
    }

    startTransition(() => {
      void authClient
        .$fetch("/organization/set-active", {
          method: "POST",
          body: {
            organizationId: autoOrganizationId,
          },
        })
        .then(() => {
          router.replace(nextPath)
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to switch organization."
          )
        })
    })
  }, [autoOrganizationId, nextPath, router])

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="rounded-xl py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Select an organization</CardTitle>
          <CardDescription>
            Choose the shared workspace that should be active for this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-6">
          {organizations.length > 0 ? (
            organizations.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-lg border px-4 py-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{entry.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {entry.memberRole}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveOrganization(entry.id)}
                  disabled={isPending}
                >
                  Open
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
              No organizations are available on this account yet.
            </div>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-xl py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>
            Invitations that match your current account email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-6">
          {invitations.length > 0 ? (
            invitations.map((entry) => (
              <div key={entry.id} className="rounded-lg border px-4 py-4">
                <div className="text-sm font-medium">{entry.organizationName}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Invited by {entry.inviterName} as {entry.role ?? "member"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Expires {new Date(entry.expiresAt).toLocaleString()}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    onClick={() => router.push(`/accept-invite?id=${encodeURIComponent(entry.id)}`)}
                    disabled={isPending}
                  >
                    Review invite
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => rejectInvitation(entry.id)}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
              No pending invitations for this email.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
