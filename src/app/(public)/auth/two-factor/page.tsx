import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { TwoFactorChallenge } from "@/components/auth/two-factor-challenge"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.twoFactor.metadataTitle"),
  }
}

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>
}) {
  const { callbackURL } = await searchParams
  const normalizedCallbackURL = normalizeCallbackURL(
    callbackURL,
    DEFAULT_AUTH_CALLBACK_URL
  )
  const { t } = await getI18n()

  return (
    <AuthShell
      title={t("auth.pages.twoFactor.title")}
      description={t("auth.pages.twoFactor.description")}
    >
      <TwoFactorChallenge callbackURL={normalizedCallbackURL} />
    </AuthShell>
  )
}
