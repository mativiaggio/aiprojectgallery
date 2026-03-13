import Link from "next/link"

import { getSiteContent } from "@/content/site"
import { getI18n } from "@/lib/i18n/server"
import { getSession } from "@/lib/session"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LinkButton } from "@/components/link-button"
import { MobileNav } from "@/components/mobile-nav"
import { PublicNav } from "@/components/public-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserDropdown } from "@/components/user-dropdown"

export async function SiteHeader() {
  const session = await getSession()
  const { locale, t } = await getI18n()
  const siteContent = getSiteContent(locale)

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-primary text-sm font-semibold text-primary-foreground">
              A
            </span>
            <div className="min-w-0">
              <div className="truncate text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-base">
                {siteContent.brand.name}
              </div>
              <div className="hidden truncate text-[0.78rem] text-muted-foreground min-[430px]:block">
                {siteContent.brand.summary}
              </div>
            </div>
          </Link>

          <PublicNav />

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            {session ? (
              <>
                <LinkButton href="/dashboard" variant="outline" size="sm" className="hidden xl:inline-flex">
                  {t("common.dashboard")}
                </LinkButton>
                <UserDropdown
                  user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                  }}
                />
              </>
            ) : (
              <>
                <LinkButton href="/auth/sign-in" variant="ghost" size="sm" className="hidden lg:inline-flex">
                  {t("common.signIn")}
                </LinkButton>
                <LinkButton href="/auth/sign-up" size="sm">
                  {t("common.createAccount")}
                </LinkButton>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <MobileNav authenticated={Boolean(session)} />
          </div>
        </div>
      </div>
    </header>
  )
}
