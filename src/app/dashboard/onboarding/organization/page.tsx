import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { OrganizationOnboardingForm } from "@/components/organization/organization-onboarding-form"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Create organization",
}

export default async function DashboardOrganizationOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const context = await getDashboardContext()

  if (!context) {
    redirect(
      `/auth/sign-in?callbackURL=${encodeURIComponent(
        "/dashboard/onboarding/organization"
      )}`
    )
  }

  const { next } = await searchParams

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">
            Organization setup
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create a shared workspace for projects, memberships, and invitation-based access.
          </p>
        </div>

        <OrganizationOnboardingForm
          nextPath={normalizeCallbackURL(next, DEFAULT_AUTH_CALLBACK_URL)}
          existingOrganizationsCount={context.organizations.length}
        />
      </div>
    </div>
  )
}
