import type { Metadata } from "next"

import { OrganizationSettingsPanel } from "@/components/organization/organization-settings-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getActiveOrganizationDetails,
  requireDashboardContext,
} from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Organization",
}

export default async function DashboardOrganizationPage() {
  const context = await requireDashboardContext("/dashboard/organization")
  const details = await getActiveOrganizationDetails(context.activeOrganization.id)

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-xl py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{context.activeOrganization.name}</CardTitle>
            <CardDescription>
              Manage members, invitations, and the shared workspace currently active in this session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-px py-0 sm:grid-cols-3">
            <SummaryCell label="Your role" value={context.activeMember.role} />
            <SummaryCell label="Members" value={String(details.members.length)} />
            <SummaryCell
              label="Pending invites"
              value={String(
                details.invitations.filter((entry) => entry.status === "pending").length
              )}
              last
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Workspace access</CardTitle>
          <CardDescription>
            Owners and admins control invitations and member roles. Members can review the roster.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <OrganizationSettingsPanel
            currentUserId={context.session.user.id}
            currentRole={context.activeMember.role}
            members={details.members.map((entry) => ({
              ...entry,
              createdAt: entry.createdAt.toISOString(),
            }))}
            invitations={details.invitations.map((entry) => ({
              ...entry,
              createdAt: entry.createdAt.toISOString(),
              expiresAt: entry.expiresAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCell({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div className={`px-5 py-5 ${last ? "" : "border-b sm:border-r sm:border-b-0"}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{value}</div>
    </div>
  )
}
