"use client"

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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function TwoFactorChallenge() {
  const router = useRouter()
  const [emailOtp, setEmailOtp] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function finalize(
    action: () => Promise<{ error: { message?: string | null } | null }>
  ) {
    setIsPending(true)
    setError(null)
    setMessage(null)

    try {
      const result = await action()

      if (result.error) {
        throw new Error(result.error.message || "Unable to validate the second factor.")
      }

      router.replace("/account")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to validate the second factor."
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
        throw new Error(result.error.message || "Unable to send email OTP.")
      }

      setMessage("A fresh verification code was sent to your email.")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to send email OTP."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Two-factor verification</CardTitle>
        <CardDescription>
          Continue with an emailed code, authenticator app code, or backup code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 py-5">
        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Email code</div>
            <p className="text-sm leading-7 text-muted-foreground">
              Request a temporary code sent through Resend.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={sendEmailCode} disabled={isPending}>
              Send code
            </Button>
            <Input
              value={emailOtp}
              onChange={(event) => setEmailOtp(event.target.value)}
              placeholder="Enter email code"
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
              Verify email code
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Authenticator app</div>
            <p className="text-sm leading-7 text-muted-foreground">
              Enter the current 6-digit code from your TOTP app.
            </p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="totpCode">TOTP code</FieldLabel>
              <Input
                id="totpCode"
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value)}
                inputMode="numeric"
                placeholder="123456"
              />
              <FieldDescription>
                This is the fastest option once two-factor has been configured.
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
            Verify authenticator
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Backup code</div>
            <p className="text-sm leading-7 text-muted-foreground">
              Use a one-time backup code if your main second factor is unavailable.
            </p>
          </div>
          <Input
            value={backupCode}
            onChange={(event) => setBackupCode(event.target.value)}
            placeholder="Paste backup code"
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
            Verify backup code
          </Button>
        </section>

        <section className="flex flex-col gap-3 rounded-[0.9rem] border p-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Trusted device</div>
            <p className="text-sm leading-7 text-muted-foreground">
              Keep this browser trusted for 30 days so you do not need a second factor
              every time.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              checked={trustDevice}
              className="size-4"
              onChange={(event) => setTrustDevice(event.target.checked)}
              type="checkbox"
            />
            Trust this device
          </label>
        </section>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </CardContent>
    </Card>
  )
}
