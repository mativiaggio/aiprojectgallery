import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { CheckEmailPanel } from "@/components/auth/check-email-panel"

export const metadata: Metadata = {
  title: "Check email",
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthShell
      title="Finish the verification step."
      description="Account creation is complete, but email confirmation still gates the verified session and the full security controls."
    >
      <CheckEmailPanel email={email} />
    </AuthShell>
  )
}
