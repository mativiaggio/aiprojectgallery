import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { OrganizationSelectionPanel } from "@/components/organization/organization-selection-panel"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Select organization",
}

export default async function DashboardSelectOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ auto?: string; next?: string }>
}) {
  const context = await getDashboardContext()

  if (!context) {
    redirect(
      `/auth/sign-in?callbackURL=${encodeURIComponent(
        "/dashboard/select-organization"
      )}`
    )
  }

  const { auto, next } = await searchParams

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">
            Select organization
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Sessions can start without an active workspace. Use this page to pick one or handle pending invitations.
          </p>
        </div>

        <OrganizationSelectionPanel
          autoOrganizationId={auto}
          nextPath={normalizeCallbackURL(next, DEFAULT_AUTH_CALLBACK_URL)}
          organizations={context.organizations.map((entry) => ({
            id: entry.id,
            name: entry.name,
            slug: entry.slug,
            memberRole: entry.memberRole,
          }))}
          invitations={context.pendingInvitations.map((entry) => ({
            id: entry.id,
            organizationName: entry.organizationName,
            inviterName: entry.inviterName,
            email: entry.email,
            role: entry.role,
            expiresAt: entry.expiresAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
