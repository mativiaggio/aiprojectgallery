"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Atom,
  Bookmark,
  FolderKanban,
  LayoutGrid,
  LifeBuoy,
  Orbit,
  Newspaper,
  Send,
  Settings2,
  Telescope,
  Users2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useI18n } from "@/lib/i18n/provider"

type DashboardSidebarProps = {
  user: {
    name: string
    email: string
  }
  activeOrganization: {
    id: string
    name: string
    slug: string
  } | null
}

const primaryItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutGrid,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: FolderKanban,
    match: (pathname: string) => pathname.startsWith("/dashboard/projects"),
  },
  {
    href: "/dashboard/submissions",
    label: "Submissions",
    icon: Send,
    match: (pathname: string) => pathname.startsWith("/dashboard/submissions"),
  },
  {
    href: "/dashboard/collections",
    label: "Collections",
    icon: Bookmark,
    match: (pathname: string) => pathname.startsWith("/dashboard/collections"),
  },
  {
    href: "/dashboard/intelligence",
    label: "Intelligence",
    icon: Telescope,
    match: (pathname: string) => pathname.startsWith("/dashboard/intelligence"),
  },
  {
    href: "/dashboard/genome",
    label: "Genome",
    icon: Atom,
    match: (pathname: string) => pathname.startsWith("/dashboard/genome"),
  },
  {
    href: "/dashboard/time-machine",
    label: "Time Machine",
    icon: Orbit,
    match: (pathname: string) => pathname.startsWith("/dashboard/time-machine"),
  },
]

const secondaryItems = [
  {
    href: "/dashboard/organization",
    label: "Organization",
    icon: Users2,
    match: (pathname: string) => pathname.startsWith("/dashboard/organization"),
  },
  {
    href: "/dashboard/account",
    label: "Account",
    icon: Settings2,
    match: (pathname: string) => pathname.startsWith("/dashboard/account"),
  },
  {
    href: "/contact",
    label: "Support",
    icon: LifeBuoy,
    match: (pathname: string) => pathname === "/contact",
  },
  {
    href: "/",
    label: "Portal",
    icon: Newspaper,
    match: (pathname: string) => pathname === "/",
  },
]

export function DashboardSidebar({ user, activeOrganization }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-1 py-1 text-left"
        >
          <span className="flex size-9 items-center justify-center rounded-[0.85rem] bg-primary text-sm font-semibold text-primary-foreground">
            A
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-[-0.03em]">
              {t("common.dashboard")}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {activeOrganization?.name ?? t("dashboard.sidebar.subtitleFallback")}
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-6">
        <SidebarGroup>
          <SidebarGroupLabel>{t("dashboard.sidebar.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.match(pathname)}>
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{translateSidebarPrimary(item.href, t)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("dashboard.sidebar.access")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.match(pathname)}>
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{translateSidebarSecondary(item.href, t)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border bg-background/70 px-3 py-3">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="truncate text-sm text-muted-foreground">{user.email}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function translateSidebarPrimary(
  href: string,
  t: <T = string>(key: import("@/lib/i18n").TranslationKey) => T
) {
  switch (href) {
    case "/dashboard":
      return t("dashboard.sidebar.overview")
    case "/dashboard/projects":
      return t("dashboard.sidebar.projects")
    case "/dashboard/submissions":
      return t("dashboard.sidebar.submissions")
    case "/dashboard/collections":
      return t("dashboard.sidebar.collections")
    case "/dashboard/intelligence":
      return t("dashboard.sidebar.intelligence")
    case "/dashboard/genome":
      return t("dashboard.sidebar.genome")
    case "/dashboard/time-machine":
      return t("dashboard.sidebar.timeMachine")
    default:
      return href
  }
}

function translateSidebarSecondary(
  href: string,
  t: <T = string>(key: import("@/lib/i18n").TranslationKey) => T
) {
  switch (href) {
    case "/dashboard/organization":
      return t("dashboard.sidebar.organization")
    case "/dashboard/account":
      return t("dashboard.sidebar.account")
    case "/contact":
      return t("dashboard.sidebar.support")
    case "/":
      return t("dashboard.sidebar.portal")
    default:
      return href
  }
}
