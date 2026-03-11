import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { TwoFactorChallenge } from "@/components/auth/two-factor-challenge"

export const metadata: Metadata = {
  title: "Two-factor verification",
}

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Complete the second factor."
      description="This checkpoint accepts authenticator codes, emailed OTPs, or backup codes generated from the account security center."
    >
      <TwoFactorChallenge />
    </AuthShell>
  )
}
