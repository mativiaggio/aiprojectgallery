"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!token) {
      setError("The reset link is missing its token.")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const password = String(formData.get("password") ?? "")
      const confirmPassword = String(formData.get("confirmPassword") ?? "")

      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setIsPending(false)
        return
      }

      await authClient.$fetch("/reset-password", {
        method: "POST",
        body: {
          newPassword: password,
          token,
        },
      })

      router.push("/auth/sign-in")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to reset password."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          This form only works with the signed reset token sent by email.
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
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FieldDescription>
                After the update you can sign in again from the regular login page.
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Updating..." : "Update password"}
            </Button>
            <Button
              render={<Link href="/auth/sign-in" />}
              nativeButton={false}
              variant="outline"
              size="lg"
            >
              Back to sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
