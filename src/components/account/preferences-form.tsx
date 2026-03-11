"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"

type PreferencesFormProps = {
  preferences: {
    productAnnouncements: boolean
    securityAlerts: boolean
    weeklyDigest: boolean
  }
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const router = useRouter()
  const [productAnnouncements, setProductAnnouncements] = useState(
    preferences.productAnnouncements
  )
  const [securityAlerts, setSecurityAlerts] = useState(preferences.securityAlerts)
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.weeklyDigest)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit() {
    setIsPending(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productAnnouncements,
          securityAlerts,
          weeklyDigest,
        }),
      })

      const payload = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update preferences.")
      }

      setNotice("Preferences updated.")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update preferences."
      )
    } finally {
      setIsPending(false)
    }
  }

  const enabledCount = [productAnnouncements, securityAlerts, weeklyDigest].filter(
    Boolean
  ).length

  return (
    <Card className="rounded-xl py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Decide which account emails are important enough to interrupt the inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <div className="rounded-lg border bg-muted/35 p-4">
          <div className="text-sm font-medium">{enabledCount} of 3 channels enabled</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Security emails should usually stay on. Marketing and digest emails depend on
            how much product noise you want.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <PreferenceRow
            checked={productAnnouncements}
            onChange={setProductAnnouncements}
            title="Product announcements"
            description="Launches, feature rollouts, listing policy changes, and important product updates."
            detail="Useful if you actively publish or manage content."
          />
          <PreferenceRow
            checked={securityAlerts}
            onChange={setSecurityAlerts}
            title="Security alerts"
            description="Verification prompts, password changes, sign-in recovery, and other sensitive events."
            detail="Recommended for every account."
            border
          />
          <PreferenceRow
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
            title="Weekly digest"
            description="A quieter recap when you want summaries instead of ad hoc updates."
            detail="Good for low-touch accounts."
            border
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t bg-muted/35 sm:flex-row sm:items-center">
        <div className="min-h-5 text-sm text-muted-foreground">
          {error ? (
            <FieldError>{error}</FieldError>
          ) : notice ? (
            notice
          ) : (
            "These preferences only control profile-linked email delivery."
          )}
        </div>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PreferenceRow({
  checked,
  onChange,
  title,
  description,
  detail,
  border = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  description: string
  detail: string
  border?: boolean
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-4 py-4 ${border ? "border-t" : ""}`}>
      <div className="space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 ${
          checked
            ? "border-primary bg-primary"
            : "border-input bg-background"
        }`}
      >
        <span className="sr-only">{title}</span>
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  )
}
