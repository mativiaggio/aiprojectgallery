"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { clearPendingCallbackURL } from "@/lib/auth/callback-url"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/provider"

export function TwoFactorChallenge({ callbackURL }: { callbackURL: string }) {
  const router = useRouter()
  const [emailOtp, setEmailOtp] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  async function finalize(
    action: () => Promise<{ error: { message?: string | null } | null }>
  ) {
    setIsPending(true)
    setError(null)
    setMessage(null)

    try {
      const result = await action()

      if (result.error) {
        throw new Error(result.error.message || t("auth.forms.twoFactor.verifyError"))
      }

      clearPendingCallbackURL()
      router.replace(callbackURL)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("auth.forms.twoFactor.verifyError")
      )
    } finally {
      setIsPending(false)
    }
  }

  async function sendEmailCode() {
    setIsPending(true)
    setError(null)
    setMessage(null)

    try {
      const result = await authClient.twoFactor.sendOtp()

      if (result.error) {
        throw new Error(result.error.message || t("auth.forms.twoFactor.sendOtpError"))
      }

      setMessage(t("auth.forms.twoFactor.sentOtp"))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : t("auth.forms.twoFactor.sendOtpError")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.twoFactor.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.twoFactor.cardDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 py-5">
        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{t("auth.forms.twoFactor.emailCode")}</div>
            <p className="text-sm leading-7 text-muted-foreground">
              {t("auth.forms.twoFactor.emailCodeDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={sendEmailCode} disabled={isPending}>
              {t("auth.forms.twoFactor.sendCode")}
            </Button>
            <Input
              value={emailOtp}
              onChange={(event) => setEmailOtp(event.target.value)}
              placeholder={t("auth.forms.twoFactor.emailCodePlaceholder")}
              inputMode="numeric"
            />
            <Button
              type="button"
              onClick={() =>
                finalize(() =>
                  authClient.twoFactor.verifyOtp({
                    code: emailOtp,
                    trustDevice,
                  })
                )
              }
              disabled={isPending || emailOtp.length < 6}
            >
              {t("auth.forms.twoFactor.verifyEmail")}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{t("auth.forms.twoFactor.authenticator")}</div>
            <p className="text-sm leading-7 text-muted-foreground">
              {t("auth.forms.twoFactor.authenticatorDescription")}
            </p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="totpCode">{t("auth.forms.twoFactor.totpCode")}</FieldLabel>
              <Input
                id="totpCode"
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value)}
                inputMode="numeric"
                placeholder={t("auth.forms.twoFactor.totpPlaceholder")}
              />
              <FieldDescription>
                {t("auth.forms.twoFactor.totpDescription")}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button
            type="button"
            onClick={() =>
              finalize(() =>
                authClient.twoFactor.verifyTotp({
                  code: totpCode,
                  trustDevice,
                })
              )
            }
            disabled={isPending || totpCode.length < 6}
          >
            {t("auth.forms.twoFactor.verifyAuthenticator")}
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{t("auth.forms.twoFactor.backupCode")}</div>
            <p className="text-sm leading-7 text-muted-foreground">
              {t("auth.forms.twoFactor.backupCodeDescription")}
            </p>
          </div>
          <Input
            value={backupCode}
            onChange={(event) => setBackupCode(event.target.value)}
            placeholder={t("auth.forms.twoFactor.backupPlaceholder")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              finalize(() =>
                authClient.twoFactor.verifyBackupCode({
                  code: backupCode,
                  trustDevice,
                })
              )
            }
            disabled={isPending || backupCode.length < 6}
          >
            {t("auth.forms.twoFactor.verifyBackup")}
          </Button>
        </section>

        <section className="flex flex-col gap-3 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{t("auth.forms.twoFactor.trustedDevice")}</div>
            <p className="text-sm leading-7 text-muted-foreground">
              {t("auth.forms.twoFactor.trustedDescription")}
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              checked={trustDevice}
              className="size-4"
              onChange={(event) => setTrustDevice(event.target.checked)}
              type="checkbox"
            />
            {t("auth.forms.twoFactor.trustDevice")}
          </label>
        </section>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </CardContent>
    </Card>
  )
}
