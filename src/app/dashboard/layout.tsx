import type { ReactNode } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireSession } from "@/lib/session"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireSession()

  return (
    <SidebarProvider className="h-[100svh] max-h-[100svh] overflow-hidden border bg-card shadow-[0_16px_40px_rgba(17,17,20,0.08)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
      <DashboardSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />
      <SidebarInset className="flex h-full max-h-full flex-col overflow-hidden bg-background">
        <DashboardHeader
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
