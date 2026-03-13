import type { Locale } from "@/lib/i18n"

function normalizeLocale(locale: Locale) {
  return locale === "es" ? "es-AR" : "en-US"
}

export function formatDateTime(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export function formatDate(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    dateStyle: "medium",
  }).format(value)
}
