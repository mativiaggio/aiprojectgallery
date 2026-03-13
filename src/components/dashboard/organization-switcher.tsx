"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Building2, Check, ChevronDown, Plus } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n/provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OrganizationSwitcherProps = {
  activeOrganization: {
    id: string
    name: string
    slug: string
  } | null
  organizations: Array<{
    id: string
    name: string
    slug: string
    memberRole: string
  }>
  pendingInvitationsCount: number
}

export function OrganizationSwitcher({
  activeOrganization,
  organizations,
  pendingInvitationsCount,
}: OrganizationSwitcherProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSwitch(organizationId: string) {
    if (organizationId === activeOrganization?.id) {
      return
    }

    startTransition(() => {
      void authClient
        .$fetch("/organization/set-active", {
          method: "POST",
          body: {
            organizationId,
          },
        })
        .then(() => {
          router.replace(
            pathname.startsWith("/dashboard/onboarding") ||
              pathname.startsWith("/dashboard/select-organization") ||
              pathname === "/accept-invite"
              ? "/dashboard"
              : pathname
          )
          router.refresh()
        })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex h-9 min-w-0 items-center gap-2 rounded-lg border bg-background px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        }
      >
        <Building2 className="size-4 text-muted-foreground" />
        <span className="max-w-36 truncate font-medium">
          {activeOrganization?.name ?? t("dashboard.organizationSwitcher.selectWorkspace")}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t("dashboard.organizationSwitcher.organizations")}
          </DropdownMenuLabel>

          <div className="p-2">
            {organizations.length > 0 ? (
              organizations.map((entry) => (
                <DropdownMenuItem
                  key={entry.id}
                  onClick={() => handleSwitch(entry.id)}
                  disabled={isPending}
                  className="min-h-11 rounded-lg px-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{entry.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {entry.memberRole}
                    </div>
                  </div>
                  {entry.id === activeOrganization?.id ? (
                    <Check className="size-4 text-foreground" />
                  ) : null}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-muted-foreground">
                {t("dashboard.organizationSwitcher.noOrganizations")}
              </div>
            )}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/dashboard/onboarding/organization?next=${encodeURIComponent(
                  pathname || "/dashboard"
                )}`
              )
            }
            className="min-h-11 rounded-lg px-3"
          >
            <Plus className="size-4" />
            {t("dashboard.organizationSwitcher.create")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/select-organization")}
            className="min-h-11 rounded-lg px-3"
          >
            <Building2 className="size-4" />
            {t("dashboard.organizationSwitcher.switchOrReview")}
            {pendingInvitationsCount > 0 ? (
              <span className="ml-auto text-xs text-muted-foreground">
                {pendingInvitationsCount}
              </span>
            ) : null}
          </DropdownMenuItem>
          {activeOrganization ? (
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/organization")}
              className="min-h-11 rounded-lg px-3"
            >
              {t("dashboard.organizationSwitcher.manageCurrent")}
            </DropdownMenuItem>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
