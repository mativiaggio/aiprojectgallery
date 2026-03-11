import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <AuthShell
      title="Set a new password."
      description="The reset token is verified server-side by Better Auth before the new password replaces the old credential."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  )
}
