"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { slugifyOrganizationName } from "@/lib/organizations/slug"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

type OrganizationOnboardingFormProps = {
  nextPath: string
  existingOrganizationsCount: number
}

export function OrganizationOnboardingForm({
  nextPath,
  existingOrganizationsCount,
}: OrganizationOnboardingFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    setNotice(null)

    startTransition(() => {
      void authClient
        .$fetch("/organization/create", {
          method: "POST",
          body: {
            name: name.trim(),
            slug: slugifyOrganizationName(slug),
          },
        })
        .then(() => {
          router.replace(nextPath)
          router.refresh()
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to create the organization."
          )
        })
    })
  }

  return (
    <Card className="rounded-xl py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>
          {existingOrganizationsCount > 0
            ? "Create another organization"
            : "Create your first organization"}
        </CardTitle>
        <CardDescription>
          {existingOrganizationsCount > 0
            ? "Additional organizations are available immediately in the dashboard switcher."
            : "New accounts start here unless a pending invitation already places you in an existing workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <FieldGroup className="grid gap-5">
          <Field>
            <FieldLabel htmlFor="organization-name">Organization name</FieldLabel>
            <Input
              id="organization-name"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value
                setName(nextName)

                if (!isSlugManual) {
                  setSlug(slugifyOrganizationName(nextName))
                }
              }}
              placeholder="Acme Studio"
            />
            <FieldDescription>
              This is the shared workspace name visible across the dashboard.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="organization-slug">Organization slug</FieldLabel>
            <Input
              id="organization-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value)
                setIsSlugManual(true)
              }}
              placeholder="acme-studio"
            />
            <FieldDescription>
              Used internally in Better Auth and invitation context.
            </FieldDescription>
          </Field>
        </FieldGroup>

        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? <FieldError>{error}</FieldError> : null}

        <div className="flex items-center justify-end border-t pt-5">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || name.trim().length < 2 || slugifyOrganizationName(slug).length < 2}
          >
            {isPending ? "Creating..." : "Create organization"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
