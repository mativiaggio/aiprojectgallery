"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  clearPendingCallbackURL,
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/provider"

export function SignInForm({ callbackURL }: { callbackURL: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    try {
      const email = String(formData.get("email") ?? "")
      const password = String(formData.get("password") ?? "")
      storePendingCallbackURL(callbackURL)

      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL,
        rememberMe: true,
      })

      if (signInError) {
        throw new Error(signInError.message || t("auth.forms.signIn.error"))
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "twoFactorRedirect" in data &&
        data.twoFactorRedirect
      ) {
        return
      }

      clearPendingCallbackURL()
      router.replace(callbackURL)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : t("auth.forms.signIn.error")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.signIn.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.signIn.cardDescription")}
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
              <FieldLabel htmlFor="email">{t("auth.forms.signIn.email")}</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{t("auth.forms.signIn.password")}</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <FieldDescription>
                {t("auth.forms.signIn.forgotPrefix")}{" "}
                <Link
                  href={withCallbackURL("/auth/forgot-password", callbackURL)}
                  className="underline underline-offset-4"
                >
                  {t("auth.forms.signIn.forgotLink")}
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? t("auth.forms.signIn.pending") : t("auth.forms.signIn.submit")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">{t("auth.forms.signIn.emptyState")}</span>
        <Link
          href={withCallbackURL("/auth/sign-up", callbackURL)}
          className="text-sm font-medium hover:underline"
        >
          {t("auth.forms.signIn.alternate")}
        </Link>
      </CardFooter>
    </Card>
  )
}
