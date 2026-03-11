import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recover access without support."
      description="Password reset emails are issued through Resend and point to a dedicated secure reset surface inside the app."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
