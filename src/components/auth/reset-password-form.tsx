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
import { useI18n } from "@/lib/i18n/provider"

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(formData: FormData) {
    if (!token) {
      setError(t("auth.forms.resetPassword.missingToken"))
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const password = String(formData.get("password") ?? "")
      const confirmPassword = String(formData.get("confirmPassword") ?? "")

      if (password !== confirmPassword) {
        setError(t("auth.forms.resetPassword.mismatch"))
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
        caughtError instanceof Error ? caughtError.message : t("auth.forms.resetPassword.error")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.resetPassword.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.resetPassword.cardDescription")}
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
              <FieldLabel htmlFor="password">{t("auth.forms.resetPassword.newPassword")}</FieldLabel>
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
              <FieldLabel htmlFor="confirmPassword">{t("auth.forms.resetPassword.confirmPassword")}</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FieldDescription>
                {t("auth.forms.resetPassword.fieldDescription")}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? t("auth.forms.resetPassword.pending") : t("auth.forms.resetPassword.submit")}
            </Button>
            <Button
              render={<Link href="/auth/sign-in" />}
              nativeButton={false}
              variant="outline"
              size="lg"
            >
              {t("auth.forms.resetPassword.back")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
