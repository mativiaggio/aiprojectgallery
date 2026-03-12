"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

type AppShellProps = {
  children: ReactNode
  publicHeader: ReactNode
  publicFooter: ReactNode
}

export function AppShell({
  children,
  publicHeader,
  publicFooter,
}: AppShellProps) {
  const pathname = usePathname()
  const isDashboardRoute = pathname?.startsWith("/dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboardRoute ? publicHeader : null}
      <main className="flex-1">{children}</main>
      {!isDashboardRoute ? publicFooter : null}
    </div>
  )
}
