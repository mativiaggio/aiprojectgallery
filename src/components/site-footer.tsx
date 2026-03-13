import Link from "next/link"

import { getSiteContent } from "@/content/site"
import { getI18n } from "@/lib/i18n/server"
import { LinkButton } from "@/components/link-button"

export async function SiteFooter() {
  const { locale, t } = await getI18n()
  const siteContent = getSiteContent(locale)

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-[0.8rem] bg-primary text-sm font-semibold text-primary-foreground">
                A
              </span>
              <div>
                <div className="text-base font-semibold tracking-[-0.03em]">
                  {siteContent.brand.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {siteContent.brand.summary}
                </div>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-3">
              <div className="text-sm font-semibold">{t("footer.explore")}</div>
              <div className="flex flex-wrap gap-4">
                {siteContent.navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold">{t("footer.startHere")}</div>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/submit" size="sm">
                  {t("common.submitLaunch")}
                </LinkButton>
                <LinkButton href="/research" variant="outline" size="sm">
                  {t("common.research")}
                </LinkButton>
                <LinkButton href="/about" variant="outline" size="sm">
                  {t("footer.readVision")}
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t("footer.editorial")}</span>
          <span>{t("footer.quality")}</span>
        </div>
      </div>
    </footer>
  )
}
