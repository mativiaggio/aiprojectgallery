import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Create account",
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create a workspace-ready account."
      description="Registration provisions your auth record, creates a profile row, sends welcome and verification emails, and prepares the account for MFA."
    >
      <SignUpForm />
    </AuthShell>
  )
}
