"use client"

// import { useRouter } from "next/navigation"
// import { ChevronDown } from "lucide-react"

import { getSiteContent } from "@/content/site"
import { useI18n } from "@/lib/i18n/provider"
import { LinkButton } from "@/components/link-button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

export function PublicNav() {
  // const router = useRouter()
  const { locale, messages } = useI18n()
  const siteContent = getSiteContent(locale)
  const primarySet = new Set<string>(messages.header.primaryLinks)
  const primaryItems = siteContent.navItems.filter((item) => primarySet.has(item.href))
  // const secondaryItems = siteContent.navItems.filter((item) => !primarySet.has(item.href))

  return (
    <nav className="hidden min-w-0 items-center gap-1 md:flex">
      {primaryItems.map((item) => (
        <LinkButton
          key={item.href}
          href={item.href}
          variant="ghost"
          size="sm"
          className="px-2.5 text-muted-foreground hover:text-foreground"
        >
          {item.label}
        </LinkButton>
      ))}
      {/* {secondaryItems.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-[0.75rem] border border-transparent px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            }
          >
            {t("common.more")}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>{t("header.secondaryGroupLabel")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {secondaryItems.map((item) => (
              <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null} */}
    </nav>
  )
}
