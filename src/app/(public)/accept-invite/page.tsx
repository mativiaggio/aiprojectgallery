import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { InviteAcceptancePanel } from "@/components/organization/invite-acceptance-panel"
import { getInvitationDetails } from "@/lib/organizations/service"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Accept invitation",
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    notFound()
  }

  const session = await getSession()

  if (!session) {
    redirect(
      `/auth/sign-in?callbackURL=${encodeURIComponent(`/accept-invite?id=${id}`)}`
    )
  }

  const invitation = await getInvitationDetails(id)

  if (!invitation) {
    notFound()
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <InviteAcceptancePanel
        invitation={{
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt.toISOString(),
          organizationName: invitation.organizationName,
          inviterName: invitation.inviterName,
          inviterEmail: invitation.inviterEmail,
        }}
        currentUserEmail={session.user.email}
        isExpired={invitation.isExpired}
      />
    </div>
  )
}
