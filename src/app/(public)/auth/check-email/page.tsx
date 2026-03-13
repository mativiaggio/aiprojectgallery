import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { CheckEmailPanel } from "@/components/auth/check-email-panel"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.checkEmail.metadataTitle"),
  }
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackURL?: string }>
}) {
  const { email, callbackURL } = await searchParams
  const normalizedCallbackURL = normalizeCallbackURL(
    callbackURL,
    DEFAULT_AUTH_CALLBACK_URL
  )
  const { t } = await getI18n()

  return (
    <AuthShell
      title={t("auth.pages.checkEmail.title")}
      description={t("auth.pages.checkEmail.description")}
    >
      <CheckEmailPanel email={email} callbackURL={normalizedCallbackURL} />
    </AuthShell>
  )
}
