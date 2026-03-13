import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.signIn.metadataTitle"),
  }
}

export default async function SignInPage({
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
      title={t("auth.pages.signIn.title")}
      description={t("auth.pages.signIn.description")}
    >
      <SignInForm callbackURL={normalizedCallbackURL} />
    </AuthShell>
  )
}
