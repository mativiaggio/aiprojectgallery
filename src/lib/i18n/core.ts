import { dictionaries, type Messages } from "@/lib/i18n/messages"

export const supportedLocales = ["en", "es"] as const
export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = "en"
export const localeCookieName = "apg_locale"
export type TranslationKey = string

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes((value ?? "") as Locale)
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

export function getMessage<T = string>(messages: Messages, key: TranslationKey): T {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined
    }

    return (current as Record<string, unknown>)[part]
  }, messages)

  return value as T
}
