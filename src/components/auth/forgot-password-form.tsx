"use client"

import { useState } from "react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setNotice(null)

    try {
      const email = String(formData.get("email") ?? "")

      await authClient.$fetch("/request-password-reset", {
        method: "POST",
        body: {
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      })

      setNotice("If the account exists, a reset email has been sent.")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start password reset."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          A secure email will let you create a new password without exposing whether an
          address exists.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        <form
          className="flex flex-col gap-5"
          action={async (formData) => {
            await handleSubmit(formData)
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
              <FieldDescription>
                The reset link opens a dedicated page where the password can be replaced.
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          {notice ? (
            <p className="text-sm text-muted-foreground" role="status">
              {notice}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Sending..." : "Send reset email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
