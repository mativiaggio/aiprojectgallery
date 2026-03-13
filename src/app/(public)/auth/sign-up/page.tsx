import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { DEFAULT_AUTH_CALLBACK_URL, normalizeCallbackURL } from "@/lib/auth/callback-url"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.signUp.metadataTitle"),
  }
}

export default async function SignUpPage({
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
      title={t("auth.pages.signUp.title")}
      description={t("auth.pages.signUp.description")}
    >
      <SignUpForm callbackURL={normalizedCallbackURL} />
    </AuthShell>
  )
}
