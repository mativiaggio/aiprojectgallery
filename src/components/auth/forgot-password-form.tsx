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
import { useI18n } from "@/lib/i18n/provider"

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

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

      setNotice(t("auth.forms.forgotPassword.notice"))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("auth.forms.forgotPassword.error")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.forgotPassword.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.forgotPassword.cardDescription")}
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
              <FieldLabel htmlFor="email">{t("auth.forms.forgotPassword.email")}</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
              <FieldDescription>
                {t("auth.forms.forgotPassword.fieldDescription")}
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
            {isPending ? t("auth.forms.forgotPassword.pending") : t("auth.forms.forgotPassword.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
