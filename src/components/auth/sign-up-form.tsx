"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  storePendingCallbackURL,
  withCallbackURL,
} from "@/lib/auth/callback-url"
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
import { useI18n } from "@/lib/i18n/provider"

export function SignUpForm({ callbackURL }: { callbackURL: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    try {
      const name = String(formData.get("name") ?? "")
      const email = String(formData.get("email") ?? "")
      const password = String(formData.get("password") ?? "")
      storePendingCallbackURL(callbackURL)

      await authClient.$fetch("/sign-up/email", {
        method: "POST",
        body: {
          name,
          email,
          password,
          callbackURL,
          rememberMe: true,
        },
      })

      router.push(
        `/auth/check-email?email=${encodeURIComponent(email)}&callbackURL=${encodeURIComponent(
          callbackURL
        )}`
      )
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : t("auth.forms.signUp.error")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.signUp.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.signUp.cardDescription")}
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
              <FieldLabel htmlFor="name">{t("auth.forms.signUp.fullName")}</FieldLabel>
              <Input id="name" name="name" autoComplete="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{t("auth.forms.signUp.email")}</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{t("auth.forms.signUp.password")}</FieldLabel>
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
            {isPending ? t("auth.forms.signUp.pending") : t("auth.forms.signUp.submit")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">{t("auth.forms.signUp.emptyState")}</span>
        <Link
          href={withCallbackURL("/auth/sign-in", callbackURL)}
          className="text-sm font-medium hover:underline"
        >
          {t("auth.forms.signUp.alternate")}
        </Link>
      </CardFooter>
    </Card>
  )
}
