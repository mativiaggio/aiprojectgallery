import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.forgotPassword.metadataTitle"),
  }
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n()

  return (
    <AuthShell
      title={t("auth.pages.forgotPassword.title")}
      description={t("auth.pages.forgotPassword.description")}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
