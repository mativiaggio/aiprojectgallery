import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to your account."
      description="Email/password access is wired to Better Auth, backed by PostgreSQL through Drizzle, and upgraded with two-factor verification when required."
    >
      <SignInForm />
    </AuthShell>
  )
}
