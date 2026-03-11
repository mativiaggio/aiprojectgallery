"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react"

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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ProfileFormProps = {
  user: {
    email: string
    name: string
  }
  profile: {
    headline: string | null
    company: string | null
    location: string | null
    website: string | null
    bio: string | null
  }
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [headline, setHeadline] = useState(profile.headline ?? "")
  const [company, setCompany] = useState(profile.company ?? "")
  const [location, setLocation] = useState(profile.location ?? "")
  const [website, setWebsite] = useState(profile.website ?? "")
  const [bio, setBio] = useState(profile.bio ?? "")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit() {
    setIsPending(true)
    setError(null)
    setNotice(null)

    try {
      if (name !== user.name) {
        await authClient.$fetch("/update-user", {
          method: "POST",
          body: {
            name,
          },
        })
      }

      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          headline,
          company,
          location,
          website,
          bio,
        }),
      })

      const payload = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update profile.")
      }

      setNotice("Profile updated.")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to update profile."
      )
    } finally {
      setIsPending(false)
    }
  }

  const previewName = name.trim() || "Unnamed account"
  const previewHeadline = headline.trim() || "Add a role or short descriptor"
  const previewBio = bio.trim() || "A short account bio helps other people understand who owns the profile."

  return (
    <Card className="rounded-xl py-0 shadow-none">
      <CardHeader className="border-b py-5">
        <CardTitle>Profile details</CardTitle>
        <CardDescription>
          Keep the identity data used in listings, receipts, and account records up to
          date.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1.18fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Identity</h2>
              <p className="text-sm text-muted-foreground">
                These fields describe who owns the account and how that identity should
                appear across the product.
              </p>
            </div>

            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profileName">Name</FieldLabel>
                <Input
                  id="profileName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="profileEmail">Email</FieldLabel>
                <Input id="profileEmail" value={user.email} disabled readOnly />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="headline">Headline</FieldLabel>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Founder, curator, product designer..."
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <Input
                  id="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Studio name or company"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, country"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://example.com"
                />
              </Field>
            </FieldGroup>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">About</h2>
              <p className="text-sm text-muted-foreground">
                Keep the bio concise. It should read well in a profile card, not only in a
                full settings page.
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={6}
                placeholder="Short summary, expertise, or context for collaborators and buyers."
              />
              <div className="text-right text-xs text-muted-foreground">{bio.length}/240</div>
            </Field>
          </section>
        </div>

        <aside className="space-y-4 rounded-lg border bg-muted/35 p-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Preview</div>
            <p className="text-sm text-muted-foreground">
              A quick read of how the account details currently land.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                {previewName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="truncate text-sm font-medium">{previewName}</div>
                <div className="text-sm text-muted-foreground">{previewHeadline}</div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <PreviewRow icon={Mail} label="Email" value={user.email} />
              <PreviewRow
                icon={Building2}
                label="Company"
                value={company.trim() || "Not provided"}
              />
              <PreviewRow
                icon={MapPin}
                label="Location"
                value={location.trim() || "Not provided"}
              />
              <PreviewRow
                icon={Globe}
                label="Website"
                value={website.trim() || "Not provided"}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserRound className="size-4 text-muted-foreground" />
              Profile summary
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{previewBio}</p>
          </div>
        </aside>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t bg-muted/35 sm:flex-row sm:items-center">
        <div className="min-h-5 text-sm text-muted-foreground">
          {error ? (
            <FieldError>{error}</FieldError>
          ) : notice ? (
            notice
          ) : (
            "Changes update the account profile record immediately."
          )}
        </div>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value: string
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium break-all">{value}</div>
    </div>
  )
}
