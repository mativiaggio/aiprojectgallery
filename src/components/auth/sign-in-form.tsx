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
  CardFooter,
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

export function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    try {
      const email = String(formData.get("email") ?? "")
      const password = String(formData.get("password") ?? "")

      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/account",
        rememberMe: true,
      })

      if (signInError) {
        throw new Error(signInError.message || "Unable to sign in.")
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "twoFactorRedirect" in data &&
        data.twoFactorRedirect
      ) {
        return
      }

      router.replace("/account")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to sign in."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use your email and password. If two-factor is active, the flow will continue
          in the next step.
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
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <FieldDescription>
                Forgot it?{" "}
                <Link href="/auth/forgot-password" className="underline underline-offset-4">
                  Reset password
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">No account yet?</span>
        <Link href="/auth/sign-up" className="text-sm font-medium hover:underline">
          Create account
        </Link>
      </CardFooter>
    </Card>
  )
}
