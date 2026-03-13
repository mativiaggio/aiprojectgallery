import { cookies } from "next/headers"

import {
  defaultLocale,
  getDictionary,
  getMessage,
  isLocale,
  localeCookieName,
  type TranslationKey,
} from "@/lib/i18n/core"

export async function getRequestLocale() {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(localeCookieName)?.value

  return isLocale(cookieLocale) ? cookieLocale : defaultLocale
}

export async function getI18n() {
  const locale = await getRequestLocale()
  const messages = getDictionary(locale)

  return {
    locale,
    messages,
    t: <T = string>(key: TranslationKey) => getMessage<T>(messages, key),
  }
}
