"use client"

import Link from "next/link"
import { useState } from "react"

import { withCallbackURL } from "@/lib/auth/callback-url"
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
import { useI18n } from "@/lib/i18n/provider"

export function CheckEmailPanel({
  email,
  callbackURL,
}: {
  email?: string
  callbackURL: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { t } = useI18n()

  async function handleResend() {
    if (!email) {
      setError(t("auth.forms.checkEmail.missingEmail"))
      return
    }

    setError(null)
    setNotice(null)
    setIsPending(true)

    try {
      await authClient.$fetch("/send-verification-email", {
        method: "POST",
        body: {
          email,
          callbackURL,
        },
      })

      setNotice(t("auth.forms.checkEmail.resendNotice"))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("auth.forms.checkEmail.resendError")
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{t("auth.forms.checkEmail.cardTitle")}</CardTitle>
        <CardDescription>
          {t("auth.forms.checkEmail.cardDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-5">
        <div className="rounded-[0.9rem] border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
          {email
            ? `${t("auth.forms.checkEmail.inboxPrefix")} ${email}`
            : t("auth.forms.checkEmail.inboxFallback")}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={handleResend} disabled={isPending}>
            {isPending ? t("auth.forms.checkEmail.pending") : t("auth.forms.checkEmail.resend")}
          </Button>
          <Button
            render={<Link href={withCallbackURL("/auth/sign-in", callbackURL)} />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            {t("auth.forms.checkEmail.back")}
          </Button>
        </div>
        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          {t("auth.forms.checkEmail.footer")}
        </span>
      </CardFooter>
    </Card>
  )
}
