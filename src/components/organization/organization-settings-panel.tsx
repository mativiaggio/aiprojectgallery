"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { canManageOrganization } from "@/lib/organizations/access"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type OrganizationSettingsPanelProps = {
  currentUserId: string
  currentRole: string
  members: Array<{
    id: string
    userId: string
    role: string
    createdAt: string
    name: string
    email: string
    image: string | null
  }>
  invitations: Array<{
    id: string
    email: string
    role: string | null
    status: string
    expiresAt: string
    createdAt: string
    inviterName: string
    inviterEmail: string
  }>
}

export function OrganizationSettingsPanel({
  currentUserId,
  currentRole,
  members,
  invitations,
}: OrganizationSettingsPanelProps) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canManage = canManageOrganization(currentRole)

  function refreshAfter(task: Promise<unknown>, successMessage: string) {
    startTransition(() => {
      void task
        .then(() => {
          setNotice(successMessage)
          setError(null)
          setInviteEmail("")
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to update organization settings."
          )
        })
    })
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Invite member</h2>
          <p className="text-sm text-muted-foreground">
            Invitations in v1 always start as member access. Owners and admins can
            promote the role later.
          </p>
        </div>

        {canManage ? (
          <div className="rounded-lg border p-4">
            <FieldGroup className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="teammate@example.com"
                />
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() =>
                    refreshAfter(
                      authClient.$fetch("/organization/invite-member", {
                        method: "POST",
                        body: {
                          email: inviteEmail.trim(),
                          role: "member",
                        },
                      }),
                      "Invitation sent."
                    )
                  }
                  disabled={isPending || inviteEmail.trim().length < 5}
                >
                  {isPending ? "Sending..." : "Send invite"}
                </Button>
              </div>
            </FieldGroup>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            Member accounts can review the organization roster, but only owners and
            admins can invite people or change roles.
          </div>
        )}

        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Members</h2>
          <p className="text-sm text-muted-foreground">
            Owners and admins can update roles for the active organization.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          {members.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{entry.name}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {entry.email}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined {new Date(entry.createdAt).toLocaleDateString()}
              </div>
              {canManage && entry.userId !== currentUserId ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={entry.role === "admin" ? "outline" : "default"}
                    onClick={() =>
                      refreshAfter(
                        authClient.$fetch("/organization/update-member-role", {
                          method: "POST",
                          body: {
                            memberId: entry.id,
                            role: entry.role === "admin" ? "member" : "admin",
                          },
                        }),
                        "Role updated."
                      )
                    }
                    disabled={isPending}
                  >
                    {entry.role === "admin" ? "Make member" : "Make admin"}
                  </Button>
                </div>
              ) : (
                <div className="text-sm font-medium">{entry.role}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Pending invitations</h2>
          <p className="text-sm text-muted-foreground">
            Cancel outstanding invitations if the recipient changes or no longer needs access.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          {invitations.length > 0 ? (
            invitations.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{entry.email}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {entry.status} · invited by {entry.inviterName}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(entry.expiresAt).toLocaleDateString()}
                </div>
                {canManage && entry.status === "pending" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      refreshAfter(
                        authClient.$fetch("/organization/cancel-invitation", {
                          method: "POST",
                          body: {
                            invitationId: entry.id,
                          },
                        }),
                        "Invitation canceled."
                      )
                    }
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                ) : (
                  <div className="text-sm font-medium">{entry.role ?? "member"}</div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-5 text-sm text-muted-foreground">
              No pending invitations.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
