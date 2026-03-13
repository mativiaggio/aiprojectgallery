"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type InviteAcceptancePanelProps = {
  invitation: {
    id: string
    email: string
    role: string | null
    status: string
    expiresAt: string
    organizationName: string
    inviterName: string
    inviterEmail: string
  }
  currentUserEmail: string
  isExpired: boolean
}

export function InviteAcceptancePanel({
  invitation,
  currentUserEmail,
  isExpired,
}: InviteAcceptancePanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const emailMatches =
    invitation.email.toLowerCase() === currentUserEmail.toLowerCase()

  function acceptInvitation() {
    setError(null)
    setNotice(null)

    startTransition(() => {
      void authClient
        .$fetch("/organization/accept-invitation", {
          method: "POST",
          body: {
            invitationId: invitation.id,
          },
        })
        .then(() => {
          router.replace("/dashboard")
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to accept the invitation."
          )
        })
    })
  }

  function rejectInvitation() {
    setError(null)
    setNotice(null)

    startTransition(() => {
      void authClient
        .$fetch("/organization/reject-invitation", {
          method: "POST",
          body: {
            invitationId: invitation.id,
          },
        })
        .then(() => {
          setNotice("Invitation rejected.")
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to reject the invitation."
          )
        })
    })
  }

  useEffect(() => {
    if (!emailMatches || isExpired || invitation.status !== "pending") {
      return
    }

    startTransition(() => {
      void authClient
        .$fetch("/organization/accept-invitation", {
          method: "POST",
          body: {
            invitationId: invitation.id,
          },
        })
        .then(() => {
          router.replace("/dashboard")
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to accept the invitation."
          )
        })
    })
  }, [emailMatches, invitation.id, invitation.status, isExpired, router])

  return (
    <Card className="mx-auto max-w-xl rounded-xl py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>Invitation to join {invitation.organizationName}</CardTitle>
        <CardDescription>
          Review the invitation before the workspace becomes active in this session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 py-6">
        <div className="space-y-2 rounded-lg border px-4 py-4 text-sm">
          <div>
            Invited by <span className="font-medium">{invitation.inviterName}</span> (
            {invitation.inviterEmail})
          </div>
          <div>Role: {invitation.role ?? "member"}</div>
          <div>Recipient: {invitation.email}</div>
          <div>Expires: {new Date(invitation.expiresAt).toLocaleString()}</div>
        </div>

        {!emailMatches ? (
          <div className="rounded-lg border bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
            This invitation targets {invitation.email}. Sign in with that exact email
            address to accept it.
          </div>
        ) : null}

        {invitation.status !== "pending" ? (
          <div className="rounded-lg border bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
            This invitation is already {invitation.status}.
          </div>
        ) : null}

        {isExpired ? (
          <div className="rounded-lg border bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
            This invitation has expired. Ask the organization to send a new link.
          </div>
        ) : null}

        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={acceptInvitation}
            disabled={isPending || !emailMatches || isExpired || invitation.status !== "pending"}
          >
            {isPending ? "Processing..." : "Accept invitation"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={rejectInvitation}
            disabled={isPending || !emailMatches || isExpired || invitation.status !== "pending"}
          >
            Reject invitation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
