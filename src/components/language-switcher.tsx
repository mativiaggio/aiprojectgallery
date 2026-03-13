"use client"

import { useRouter } from "next/navigation"
import { Check, Languages } from "lucide-react"

import { useI18n } from "@/lib/i18n/provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const router = useRouter()
  const { locale, setLocale, t } = useI18n()

  function handleChange(nextLocale: "en" | "es") {
    if (nextLocale === locale) {
      return
    }

    setLocale(nextLocale)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("common.openLanguageMenu")}
            className="bg-background hover:bg-muted dark:bg-secondary dark:hover:bg-muted"
          />
        }
      >
        <Languages className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => handleChange("en")} className="justify-between">
          {t("common.english")}
          {locale === "en" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("es")} className="justify-between">
          {t("common.spanish")}
          {locale === "es" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
