"use client"

import Link from "next/link"
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

export function CheckEmailPanel({ email }: { email?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleResend() {
    if (!email) {
      setError("No email was provided for the resend flow.")
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
          callbackURL: "/account?verified=1",
        },
      })

      setNotice("Verification email sent again.")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to resend verification."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent verification and welcome emails. Use the verification link to unlock
          the full account flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-5">
        <div className="rounded-[0.9rem] border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
          {email
            ? `Primary inbox: ${email}`
            : "Your account email will receive the verification link."}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={handleResend} disabled={isPending}>
            {isPending ? "Sending..." : "Resend verification"}
          </Button>
          <Button
            render={<Link href="/auth/sign-in" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            Go to sign in
          </Button>
        </div>
        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          The verification link signs you in automatically after confirmation.
        </span>
      </CardFooter>
    </Card>
  )
}
