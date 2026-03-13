import { redirect } from "next/navigation"
import { and, asc, eq, gt, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { invitation, member, organization, user } from "@/lib/db/schema"
import { normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getSession } from "@/lib/session"

type AuthSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

export type OrganizationSummary = {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: Date
  memberId: string
  memberRole: string
  memberCreatedAt: Date
}

export type PendingInvitationSummary = {
  id: string
  email: string
  role: string | null
  status: string
  expiresAt: Date
  createdAt: Date
  organizationId: string
  organizationName: string
  organizationSlug: string
  inviterId: string
  inviterName: string
  inviterEmail: string
}

export type ActiveMember = {
  id: string
  organizationId: string
  userId: string
  role: string
  createdAt: Date
}

export type DashboardContext = {
  session: AuthSession
  activeOrganization: OrganizationSummary | null
  activeMember: ActiveMember | null
  organizations: OrganizationSummary[]
  pendingInvitations: PendingInvitationSummary[]
}

export type RequiredDashboardContext = DashboardContext & {
  activeOrganization: OrganizationSummary
  activeMember: ActiveMember
}

export async function getDashboardContext(): Promise<DashboardContext | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  const [organizations, pendingInvitations] = await Promise.all([
    db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        createdAt: organization.createdAt,
        memberId: member.id,
        memberRole: member.role,
        memberCreatedAt: member.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, session.user.id))
      .orderBy(asc(organization.name), asc(organization.createdAt)),
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        organizationId: invitation.organizationId,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        inviterId: invitation.inviterId,
        inviterName: user.name,
        inviterEmail: user.email,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .innerJoin(user, eq(invitation.inviterId, user.id))
      .where(
        and(
          eq(sql`lower(${invitation.email})`, session.user.email.toLowerCase()),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date())
        )
      )
      .orderBy(asc(organization.name), asc(invitation.createdAt)),
  ])

  const activeOrganization =
    organizations.find(
      (entry) => entry.id === session.session.activeOrganizationId
    ) ?? null

  const activeMember = activeOrganization
    ? {
        id: activeOrganization.memberId,
        organizationId: activeOrganization.id,
        userId: session.user.id,
        role: activeOrganization.memberRole,
        createdAt: activeOrganization.memberCreatedAt,
      }
    : null

  return {
    session,
    activeOrganization,
    activeMember,
    organizations,
    pendingInvitations,
  }
}

export async function requireDashboardContext(
  nextPath = "/dashboard"
): Promise<RequiredDashboardContext> {
  const context = await getDashboardContext()
  const normalizedNext = normalizeCallbackURL(nextPath)

  if (!context) {
    redirect(
      `/auth/sign-in?callbackURL=${encodeURIComponent(normalizedNext)}`
    )
  }

  if (context.activeOrganization && context.activeMember) {
    return context as RequiredDashboardContext
  }

  if (context.organizations.length === 1) {
    redirect(
      `/dashboard/select-organization?auto=${encodeURIComponent(
        context.organizations[0].id
      )}&next=${encodeURIComponent(normalizedNext)}`
    )
  }

  if (context.organizations.length > 1) {
    redirect(
      `/dashboard/select-organization?next=${encodeURIComponent(normalizedNext)}`
    )
  }

  if (context.pendingInvitations.length === 1) {
    redirect(
      `/accept-invite?id=${encodeURIComponent(context.pendingInvitations[0].id)}`
    )
  }

  if (context.pendingInvitations.length > 1) {
    redirect(
      `/dashboard/select-organization?next=${encodeURIComponent(normalizedNext)}`
    )
  }

  redirect(
    `/dashboard/onboarding/organization?next=${encodeURIComponent(normalizedNext)}`
  )
}

export async function getProjectActor() {
  const context = await getDashboardContext()

  if (!context?.activeOrganization || !context.activeMember) {
    return null
  }

  return {
    session: context.session,
    organizationId: context.activeOrganization.id,
    userId: context.session.user.id,
    role: context.activeMember.role,
  }
}

export async function getInvitationDetails(invitationId: string) {
  const result = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      organizationId: invitation.organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      inviterId: invitation.inviterId,
      inviterName: user.name,
      inviterEmail: user.email,
      isExpired: sql<boolean>`${invitation.expiresAt} <= now()`,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(eq(invitation.id, invitationId))
    .limit(1)

  return result[0] ?? null
}

export async function getActiveOrganizationDetails(organizationId: string) {
  const [members, invitations] = await Promise.all([
    db
      .select({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId))
      .orderBy(asc(user.name), asc(user.email)),
    db
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        inviterId: invitation.inviterId,
        inviterName: user.name,
        inviterEmail: user.email,
      })
      .from(invitation)
      .innerJoin(user, eq(invitation.inviterId, user.id))
      .where(eq(invitation.organizationId, organizationId))
      .orderBy(asc(invitation.email), asc(invitation.createdAt)),
  ])

  return {
    members,
    invitations,
  }
}
