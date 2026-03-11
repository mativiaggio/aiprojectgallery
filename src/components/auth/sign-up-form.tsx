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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    try {
      const name = String(formData.get("name") ?? "")
      const email = String(formData.get("email") ?? "")
      const password = String(formData.get("password") ?? "")

      await authClient.$fetch("/sign-up/email", {
        method: "POST",
        body: {
          name,
          email,
          password,
          callbackURL: "/account",
          rememberMe: true,
        },
      })

      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to create account."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Registration sends a welcome email, verification email, and unlocks your
          personal workspace.
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
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" name="name" autoComplete="name" required />
            </Field>
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
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Already registered?</span>
        <Link href="/auth/sign-in" className="text-sm font-medium hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
