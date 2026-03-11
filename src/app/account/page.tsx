import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import {
  Bell,
  Globe,
  MapPin,
  Shield,
  UserRound,
} from "lucide-react"

import { AccountActions } from "@/components/account/account-actions"
import { PreferencesForm } from "@/components/account/preferences-form"
import { ProfileForm } from "@/components/account/profile-form"
import { SecurityPanel } from "@/components/account/security-panel"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { userProfiles } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Account",
}

export default async function AccountPage() {
  const session = await requireSession()
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  const profileFields = [
    profile?.headline,
    profile?.company,
    profile?.location,
    profile?.website,
    profile?.bio,
  ]
  const completedProfileFields = profileFields.filter(Boolean).length
  const profileCompletion = Math.round(
    (completedProfileFields / profileFields.length) * 100
  )

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">Account</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage the profile details, delivery preferences, and security controls tied
            to your account.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="rounded-xl py-0 shadow-none">
              <CardContent className="flex flex-col gap-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-lg font-semibold">
                    {session.user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="space-y-1">
                      <div className="truncate text-lg font-semibold tracking-[-0.03em]">
                        {session.user.name}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {session.user.email}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={session.user.emailVerified ? "secondary" : "outline"}>
                        {session.user.emailVerified ? "Email verified" : "Verification pending"}
                      </Badge>
                      <Badge
                        variant={session.user.twoFactorEnabled ? "secondary" : "outline"}
                      >
                        {session.user.twoFactorEnabled ? "2FA enabled" : "2FA off"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                  <RailRow
                    icon={UserRound}
                    label="Profile coverage"
                    value={`${profileCompletion}%`}
                    detail={`${completedProfileFields} of ${profileFields.length} profile fields completed`}
                  />
                  <RailRow
                    icon={Shield}
                    label="Security"
                    value={session.user.twoFactorEnabled ? "Protected" : "Review"}
                    detail={
                      session.user.twoFactorEnabled
                        ? "Authenticator and backup options are active"
                        : "Enable two-factor authentication"
                    }
                  />
                  <RailRow
                    icon={Bell}
                    label="Digest"
                    value={profile?.weeklyDigest ? "Weekly" : "Off"}
                    detail="Control email delivery in preferences"
                    last
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Sections</div>
                  <nav className="grid gap-1">
                    <SectionLink href="#profile" label="Profile details" />
                    <SectionLink href="#preferences" label="Notifications" />
                    <SectionLink href="#security" label="Security and access" />
                  </nav>
                </div>

                <AccountActions />
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            <Card className="rounded-xl py-0 shadow-none">
              <CardHeader className="border-b py-5">
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  A short status summary so the important account details are visible at a
                  glance.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-px py-0 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewCell
                  icon={UserRound}
                  label="Display name"
                  value={session.user.name}
                  detail={profile?.headline || "Add a headline for listings and profile cards"}
                />
                <OverviewCell
                  icon={MapPin}
                  label="Location"
                  value={profile?.location || "Not set"}
                  detail={profile?.company || "No company added"}
                />
                <OverviewCell
                  icon={Globe}
                  label="Website"
                  value={profile?.website || "Not set"}
                  detail={profile?.website ? "Visible in public profile data" : "Add a primary site or portfolio"}
                />
                <OverviewCell
                  icon={Shield}
                  label="Access"
                  value={session.user.twoFactorEnabled ? "Two-factor active" : "Password only"}
                  detail={
                    session.user.emailVerified
                      ? "Email address is verified"
                      : "Email address still needs verification"
                  }
                  last
                />
              </CardContent>
            </Card>

            <section id="profile">
              <ProfileForm
                user={{
                  email: session.user.email,
                  name: session.user.name,
                }}
                profile={{
                  headline: profile?.headline ?? null,
                  company: profile?.company ?? null,
                  location: profile?.location ?? null,
                  website: profile?.website ?? null,
                  bio: profile?.bio ?? null,
                }}
              />
            </section>

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
              <section id="preferences">
                <PreferencesForm
                  preferences={{
                    productAnnouncements: profile?.productAnnouncements ?? true,
                    securityAlerts: profile?.securityAlerts ?? true,
                    weeklyDigest: profile?.weeklyDigest ?? false,
                  }}
                />
              </section>

              <section id="security">
                <SecurityPanel
                  user={{
                    email: session.user.email,
                    emailVerified: session.user.emailVerified,
                    twoFactorEnabled: session.user.twoFactorEnabled,
                  }}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </a>
  )
}

function RailRow({
  icon: Icon,
  label,
  value,
  detail,
  last = false,
}: {
  icon: typeof UserRound
  label: string
  value: string
  detail: string
  last?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 px-4 py-4 ${last ? "" : "border-b"}`}>
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

function OverviewCell({
  icon: Icon,
  label,
  value,
  detail,
  last = false,
}: {
  icon: typeof UserRound
  label: string
  value: string
  detail: string
  last?: boolean
}) {
  return (
    <div
      className={`flex min-h-36 flex-col gap-4 px-5 py-5 ${last ? "" : "border-b sm:border-r xl:border-b-0"}`}
    >
      <div className="text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="space-y-1.5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-sm font-medium leading-6 break-all">{value}</div>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
