import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()

  return {
    title: t("auth.pages.resetPassword.metadataTitle"),
  }
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const { t } = await getI18n()

  return (
    <AuthShell
      title={t("auth.pages.resetPassword.title")}
      description={t("auth.pages.resetPassword.description")}
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  )
}
