"use client"

import type { ClipboardEvent, KeyboardEvent } from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import {
  Copy,
  KeyRound,
  MailCheck,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Badge } from "@/components/ui/badge"
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

type SecurityPanelProps = {
  user: {
    email: string
    emailVerified: boolean
    twoFactorEnabled?: boolean | null
  }
}

type PendingSetup = {
  backupCodes: string[]
  totpURI: string
} | null

export function SecurityPanel({ user }: SecurityPanelProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [enablePassword, setEnablePassword] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")
  const [setup, setSetup] = useState<PendingSetup>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function perform(task: () => Promise<void>) {
    setIsPending(true)
    setError(null)
    setNotice(null)

    try {
      await task()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to update security."
      )
    } finally {
      setIsPending(false)
    }
  }

  const manualKey = setup ? extractTotpSecret(setup.totpURI) : null

  async function copyText(value: string, message: string) {
    await navigator.clipboard.writeText(value)
    setNotice(message)
  }

  return (
    <Card className="rounded-xl py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>Security and access</CardTitle>
        <CardDescription>
          Password controls, email verification, and two-factor authentication all live
          here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 py-6">
        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Email verification</div>
                <p className="text-sm leading-6 text-muted-foreground">
                  The verified address is used for recovery, confirmations, and sensitive
                  account notices.
                </p>
              </div>
              <Badge variant={user.emailVerified ? "secondary" : "outline"}>
                {user.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>

            <StatusBanner
              tone={user.emailVerified ? "success" : "warning"}
              icon={user.emailVerified ? MailCheck : ShieldAlert}
              title={user.emailVerified ? "Email confirmed" : "Verification still required"}
              description={
                user.emailVerified
                  ? `${user.email} is ready for recovery and security flows.`
                  : `${user.email} still needs confirmation before it can fully support account recovery.`
              }
            />

            {!user.emailVerified ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  perform(async () => {
                    await authClient.$fetch("/send-verification-email", {
                      method: "POST",
                      body: {
                        email: user.email,
                        callbackURL: "/dashboard/account?verified=1",
                      },
                    })

                    setNotice("Verification email sent.")
                  })
                }
                disabled={isPending}
              >
                Resend verification
              </Button>
            ) : null}
          </section>

          <section className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Change password</div>
              <p className="text-sm leading-6 text-muted-foreground">
                Updating the password will protect future sessions and can revoke other
                active devices.
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </Field>
            </FieldGroup>

            <Button
              type="button"
              onClick={() =>
                perform(async () => {
                  await authClient.$fetch("/change-password", {
                    method: "POST",
                    body: {
                      currentPassword,
                      newPassword,
                      revokeOtherSessions: true,
                    },
                  })

                  setCurrentPassword("")
                  setNewPassword("")
                  setNotice("Password updated.")
                })
              }
              disabled={isPending || !currentPassword || !newPassword}
            >
              Update password
            </Button>
          </section>
        </div>

        <section className="space-y-5 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Two-factor authentication</div>
              <p className="text-sm leading-6 text-muted-foreground">
                Use an authenticator app for sign-in confirmation, with backup codes kept
                as the fallback path.
              </p>
            </div>
            <Badge variant={user.twoFactorEnabled ? "secondary" : "outline"}>
              {user.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <StatusBanner
            tone={user.twoFactorEnabled ? "success" : "warning"}
            icon={user.twoFactorEnabled ? ShieldCheck : ShieldAlert}
            title={user.twoFactorEnabled ? "Authenticator active" : "Password-only account"}
            description={
              user.twoFactorEnabled
                ? "You can rotate backup codes or disable two-factor if the device setup changes."
                : "Start with your current password, scan the QR code, then confirm one live code."
            }
          />

          {user.twoFactorEnabled ? (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="disablePassword">
                  Current password for sensitive actions
                </FieldLabel>
                <Input
                  id="disablePassword"
                  type="password"
                  value={disablePassword}
                  onChange={(event) => setDisablePassword(event.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    perform(async () => {
                      const result = await authClient.twoFactor.generateBackupCodes({
                        password: disablePassword,
                      })

                      if (result.error) {
                        throw new Error(
                          result.error.message || "Unable to regenerate backup codes."
                        )
                      }

                      if (Array.isArray(result.data?.backupCodes)) {
                        setBackupCodes(result.data.backupCodes)
                      }

                      setNotice("Backup codes regenerated.")
                      router.refresh()
                    })
                  }
                  disabled={isPending || !disablePassword}
                >
                  <RefreshCcw className="size-4" />
                  Regenerate backup codes
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    perform(async () => {
                      const result = await authClient.twoFactor.disable({
                        password: disablePassword,
                      })

                      if (result.error) {
                        throw new Error(
                          result.error.message || "Unable to disable two-factor."
                        )
                      }

                      setBackupCodes([])
                      setDisablePassword("")
                      setNotice("Two-factor disabled.")
                      router.refresh()
                    })
                  }
                  disabled={isPending || !disablePassword}
                >
                  <Trash2 className="size-4" />
                  Disable two-factor
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="enablePassword">Current password</FieldLabel>
                <Input
                  id="enablePassword"
                  type="password"
                  value={enablePassword}
                  onChange={(event) => setEnablePassword(event.target.value)}
                />
              </Field>

              <Button
                type="button"
                onClick={() =>
                  perform(async () => {
                    const result = await authClient.twoFactor.enable({
                      password: enablePassword,
                    })

                    if (result.error) {
                      throw new Error(
                        result.error.message || "Unable to start two-factor setup."
                      )
                    }

                    if (result.data?.totpURI && Array.isArray(result.data.backupCodes)) {
                      setSetup({
                        totpURI: result.data.totpURI,
                        backupCodes: result.data.backupCodes,
                      })
                      setNotice("Authenticator setup created. Verify one live code to finish.")
                    }
                  })
                }
                disabled={isPending || !enablePassword}
              >
                <KeyRound className="size-4" />
                Start two-factor setup
              </Button>
            </div>
          )}

          {setup ? (
            <div className="space-y-4 border-t pt-5">
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-3 rounded-lg border bg-muted/35 p-4">
                  <div className="text-sm font-medium">Scan QR code</div>
                  <div className="flex justify-center rounded-lg border bg-white p-3">
                    <QRCode value={setup.totpURI} size={160} />
                  </div>

                  {manualKey ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Manual entry key
                      </div>
                      <div className="rounded-lg border bg-background px-3 py-2 font-mono text-sm break-all">
                        {manualKey}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          perform(async () => {
                            await copyText(
                              manualKey.replaceAll(" ", ""),
                              "Authenticator key copied."
                            )
                          })
                        }
                        disabled={isPending}
                      >
                        <Copy className="size-4" />
                        Copy key
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Enter verification code</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Enter the 6-digit code currently shown in your authenticator app to
                      complete setup.
                    </p>
                  </div>

                  <TotpCodeInput value={totpCode} onChange={setTotpCode} disabled={isPending} />

                  <Button
                    type="button"
                    onClick={() =>
                      perform(async () => {
                        const result = await authClient.twoFactor.verifyTotp({
                          code: totpCode,
                        })

                        if (result.error) {
                          throw new Error(
                            result.error.message || "Unable to verify authenticator code."
                          )
                        }

                        setBackupCodes(setup.backupCodes)
                        setSetup(null)
                        setTotpCode("")
                        setEnablePassword("")
                        setNotice("Two-factor enabled.")
                        router.refresh()
                      })
                    }
                    disabled={isPending || totpCode.length < 6}
                  >
                    Verify authenticator
                  </Button>
                </div>
              </div>

              <BackupCodeList
                codes={setup.backupCodes}
                onCopy={() =>
                  perform(async () => {
                    await copyText(setup.backupCodes.join("\n"), "Backup codes copied.")
                  })
                }
              />
            </div>
          ) : null}

          {backupCodes.length ? (
            <BackupCodeList
              codes={backupCodes}
              onCopy={() =>
                perform(async () => {
                  await copyText(backupCodes.join("\n"), "Backup codes copied.")
                })
              }
            />
          ) : null}
        </section>
      </CardContent>
      <CardFooter className="flex min-h-16 items-center border-t bg-muted/35">
        <div className="text-sm text-muted-foreground">
          {error ? <FieldError>{error}</FieldError> : notice || "Security changes apply immediately."}
        </div>
      </CardFooter>
    </Card>
  )
}

function StatusBanner({
  tone,
  icon: Icon,
  title,
  description,
}: {
  tone: "success" | "warning"
  icon: typeof ShieldCheck
  title: string
  description: string
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        tone === "success"
          ? "border-border bg-muted/35"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={
            tone === "success" ? "text-foreground" : "text-primary"
          }
        >
          <Icon className="mt-0.5 size-4" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function BackupCodeList({
  codes,
  onCopy,
}: {
  codes: string[]
  onCopy: () => void
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Backup codes</div>
          <p className="text-sm leading-6 text-muted-foreground">
            Store these offline. Each code is single-use and helps recover access if the
            authenticator is unavailable.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy className="size-4" />
          Copy all
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {codes.map((code) => (
          <div
            key={code}
            className="rounded-lg border bg-background px-3 py-2 font-mono text-sm"
          >
            {code}
          </div>
        ))}
      </div>
    </div>
  )
}

function TotpCodeInput({
  value,
  onChange,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "")

  function updateDigit(index: number, rawValue: string) {
    const normalized = rawValue.replace(/\D/g, "")
    const nextDigits = [...digits]

    nextDigits[index] = normalized ? normalized.at(-1) ?? "" : ""
    onChange(nextDigits.join("").slice(0, 6))

    if (normalized && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      const nextDigits = [...digits]
      nextDigits[index - 1] = ""
      onChange(nextDigits.join(""))
      inputsRef.current[index - 1]?.focus()
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }

    if (event.key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (!pasted) {
      return
    }

    event.preventDefault()
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, inputsRef.current.length) - 1
    inputsRef.current[Math.max(focusIndex, 0)]?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element
            }}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.currentTarget.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            className="h-12 w-11 rounded-lg border border-input bg-background text-center font-mono text-xl font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:bg-input/60"
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Paste works too if your authenticator app already copied the code.
      </div>
    </div>
  )
}

function extractTotpSecret(totpURI: string) {
  const match = /[?&]secret=([^&]+)/.exec(totpURI)

  if (!match?.[1]) {
    return null
  }

  const secret = decodeURIComponent(match[1]).replace(/\s+/g, "")
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret
}
