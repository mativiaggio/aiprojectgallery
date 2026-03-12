"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FolderKanban,
  LayoutGrid,
  LifeBuoy,
  Newspaper,
  Send,
  Settings2,
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

type DashboardSidebarProps = {
  user: {
    name: string
    email: string
  }
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
]

const secondaryItems = [
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

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

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
              Dashboard
            </div>
            <div className="truncate text-sm text-muted-foreground">
              Internal workspace
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-6">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.match(pathname)}>
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.match(pathname)}>
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
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
