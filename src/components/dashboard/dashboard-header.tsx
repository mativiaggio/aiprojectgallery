"use client"

import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserDropdown } from "@/components/user-dropdown"
import { SidebarTrigger } from "@/components/ui/sidebar"

type DashboardHeaderProps = {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

const titles: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Overview",
    description: "A compact home for the account, projects, and the live submissions workflow.",
  },
  "/dashboard/projects": {
    title: "Projects",
    description: "Track published listings, processing states, and any projects that need another screenshot pass.",
  },
  "/dashboard/submissions": {
    title: "Submissions",
    description: "Create a new project submission and monitor the screenshot pipeline in real time.",
  },
  "/dashboard/account": {
    title: "Account",
    description: "Profile, notification preferences, and security settings inside the dashboard.",
  },
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const copy =
    titles[pathname] ??
    (pathname.startsWith("/dashboard/projects/") ? {
      title: "Project detail",
      description: "Review one submission, reopen links, and retry the preview pipeline if needed.",
    } : titles["/dashboard"])

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="lg:hidden" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold tracking-[-0.03em]">
            {copy.title}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {copy.description}
          </div>
        </div>
        <ThemeToggle />
        <UserDropdown user={user} />
      </div>
    </header>
  )
}
