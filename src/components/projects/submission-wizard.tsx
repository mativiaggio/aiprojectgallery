"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react"

import { ProjectImage } from "@/components/projects/project-image"
import { LinkButton } from "@/components/link-button"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectStructuredFields } from "@/components/projects/project-structured-fields"
import { TokenField } from "@/components/projects/token-field"
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
import { Textarea } from "@/components/ui/textarea"
import {
  AI_TOOL_SUGGESTIONS,
  PROJECT_STATUS,
  PROJECT_TAG_SUGGESTIONS,
  type SubmissionFieldErrors,
  type SubmissionPayload,
} from "@/lib/projects/types"

const steps = [
  {
    eyebrow: "01",
    title: "Project basics",
    description: "Start with the public surface people will actually click into.",
  },
  {
    eyebrow: "02",
    title: "Discovery metadata",
    description: "Add the AI stack and browsing tags that will power the listing.",
  },
] as const

type CreatedProject = {
  id: string
  slug: string
  name: string
  status: "processing" | "published" | "failed"
  screenshotUrl: string | null
  processingError: string | null
}

export function SubmissionWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<SubmissionPayload>({
    name: "",
    shortDescription: "",
    appUrl: "",
    repositoryUrl: "",
    aiTools: [],
    tags: [],
    primaryUseCase: undefined,
    buyerType: undefined,
    interactionModel: undefined,
    pricingVisibility: undefined,
    deploymentSurface: undefined,
    modelVendorMix: undefined,
  })
  const [fieldErrors, setFieldErrors] = useState<SubmissionFieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [createdProject, setCreatedProject] = useState<CreatedProject | null>(null)
  const [isSubmitting, startSubmission] = useTransition()

  useEffect(() => {
    if (!createdProject || createdProject.status !== PROJECT_STATUS.processing) {
      return
    }

    let isDisposed = false

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/projects/${createdProject.id}`, {
        cache: "no-store",
      })

      if (!response.ok || isDisposed) {
        return
      }

      const payload = (await response.json()) as {
        ok: boolean
        project?: CreatedProject
      }

      if (!payload.project || isDisposed) {
        return
      }

      setCreatedProject(payload.project)

      if (payload.project.status !== PROJECT_STATUS.processing) {
        window.clearInterval(interval)
      }

      router.refresh()
    }, 4_000)

    return () => {
      isDisposed = true
      window.clearInterval(interval)
    }
  }, [createdProject, router])

  function updateField<Key extends keyof SubmissionPayload>(key: Key, value: SubmissionPayload[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }))
  }

  function goToNextStep() {
    const nextErrors: SubmissionFieldErrors = {}

    if (step === 0) {
      if (form.name.trim().length < 2) {
        nextErrors.name = "Add the project name first."
      }

      if (form.shortDescription.trim().length < 24) {
        nextErrors.shortDescription = "Add a more informative short description."
      }

      if (!form.appUrl.trim()) {
        nextErrors.appUrl = "Add the public application URL."
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...nextErrors }))
      return
    }

    setStep(1)
  }

  function handleSubmit() {
    setMessage(null)
    setFieldErrors({})

    startSubmission(() => {
      void submitProject()
    })
  }

  async function submitProject() {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    })

    const payload = (await response.json()) as
      | {
          ok: true
          project: CreatedProject
        }
      | {
          ok: false
          message: string
          fieldErrors?: SubmissionFieldErrors
        }

    if (!payload.ok) {
      setMessage(payload.message)
      setFieldErrors(payload.fieldErrors ?? {})
      return
    }

    setCreatedProject(payload.project)
    setMessage(
      "Submission created. We are generating the gallery preview now. Ownership verification is available from the management page."
    )
    router.refresh()
  }

  const currentStep = steps[step]

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <Card className="rounded-[1.4rem] py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {currentStep.eyebrow}
              </div>
              <CardTitle className="text-2xl tracking-[-0.05em]">{currentStep.title}</CardTitle>
              <CardDescription className="max-w-xl leading-7">
                {currentStep.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-3">
              Step {step + 1} of {steps.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          {step === 0 ? (
            <FieldGroup className="grid gap-5">
              <Field>
                <FieldLabel htmlFor="submission-name">Project name</FieldLabel>
                <Input
                  id="submission-name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Patchbay AI"
                />
                {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="submission-description">Short description</FieldLabel>
                <Textarea
                  id="submission-description"
                  value={form.shortDescription}
                  onChange={(event) => updateField("shortDescription", event.target.value)}
                  rows={6}
                  placeholder="Describe the product, its audience, and the job it does in one tight paragraph."
                />
                <div className="text-right text-xs text-muted-foreground">
                  {form.shortDescription.length}/220
                </div>
                {fieldErrors.shortDescription ? (
                  <FieldError>{fieldErrors.shortDescription}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="submission-app-url">Application URL</FieldLabel>
                <Input
                  id="submission-app-url"
                  type="url"
                  value={form.appUrl}
                  onChange={(event) => updateField("appUrl", event.target.value)}
                  placeholder="https://patchbay.so"
                />
                {fieldErrors.appUrl ? <FieldError>{fieldErrors.appUrl}</FieldError> : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="submission-repo-url">Repository URL</FieldLabel>
                <Input
                  id="submission-repo-url"
                  type="url"
                  value={form.repositoryUrl}
                  onChange={(event) => updateField("repositoryUrl", event.target.value)}
                  placeholder="https://github.com/acme/patchbay"
                />
                {fieldErrors.repositoryUrl ? (
                  <FieldError>{fieldErrors.repositoryUrl}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
          ) : (
            <div className="space-y-6">
              <TokenField
                label="AI tools used"
                description="Mix suggested tools with your own stack labels. The gallery keeps the final set concise."
                value={form.aiTools}
                onChange={(value) => updateField("aiTools", value)}
                suggestions={AI_TOOL_SUGGESTIONS}
                error={fieldErrors.aiTools}
              />

              <TokenField
                label="Tags and categories"
                description="Choose the themes people should use to discover the project."
                value={form.tags}
                onChange={(value) => updateField("tags", value)}
                suggestions={PROJECT_TAG_SUGGESTIONS}
                error={fieldErrors.tags}
              />

              <ProjectStructuredFields
                value={{
                  primaryUseCase: form.primaryUseCase,
                  buyerType: form.buyerType,
                  interactionModel: form.interactionModel,
                  pricingVisibility: form.pricingVisibility,
                  deploymentSurface: form.deploymentSurface,
                  modelVendorMix: form.modelVendorMix,
                }}
                onChange={updateField}
                errors={fieldErrors}
              />

              <div className="rounded-[1.2rem] border bg-muted/25 p-5">
                <div className="text-sm font-medium">Submission summary</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-lg font-medium tracking-[-0.03em]">{form.name || "Untitled project"}</div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {form.shortDescription || "Your short description will appear here."}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SummaryBlock label="Application URL" value={form.appUrl || "Not added yet"} />
                    <SummaryBlock
                      label="Repository"
                      value={form.repositoryUrl?.trim() || "Optional"}
                    />
                    <SummaryBlock
                      label="AI tools"
                      value={form.aiTools.length > 0 ? form.aiTools.join(", ") : "Add at least one"}
                    />
                    <SummaryBlock
                      label="Tags"
                      value={form.tags.length > 0 ? form.tags.join(", ") : "Optional but recommended"}
                    />
                    <SummaryBlock
                      label="Use case"
                      value={form.primaryUseCase || "Can be inferred later"}
                    />
                    <SummaryBlock
                      label="Buyer"
                      value={form.buyerType || "Can be inferred later"}
                    />
                    <SummaryBlock
                      label="Interaction"
                      value={form.interactionModel || "Can be inferred later"}
                    />
                    <SummaryBlock
                      label="Pricing"
                      value={form.pricingVisibility || "Can be inferred later"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {message ? (
            <div className="rounded-[1rem] border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
              {message}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            ) : null}

            {step === 0 ? (
              <Button type="button" size="lg" onClick={goToNextStep}>
                Next step
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating submission..." : "Publish submission"}
                <Sparkles className="size-4" />
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            The listing is created immediately. Domain ownership verification happens later from the management page.
          </p>
        </CardFooter>
      </Card>

      <Card className="rounded-[1.4rem] py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <CardTitle>Live status</CardTitle>
          <CardDescription>
            Your latest submission appears here while the screenshot pipeline finishes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          {createdProject ? (
            <div className="space-y-4 rounded-[1.2rem] border bg-muted/25 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Latest submission</div>
                  <div className="mt-1 text-xl font-medium tracking-[-0.04em]">
                    {createdProject.name}
                  </div>
                </div>
                <ProjectStatusBadge status={createdProject.status} />
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {createdProject.status === PROJECT_STATUS.processing
                  ? "We already stored the listing and are generating the public preview now."
                  : createdProject.status === PROJECT_STATUS.published
                    ? "The project is live in the gallery with its generated screenshot."
                    : createdProject.processingError || "The screenshot could not be generated yet."}
              </p>

              {createdProject.screenshotUrl ? (
                <ProjectImage
                  src={createdProject.screenshotUrl}
                  alt={`${createdProject.name} screenshot`}
                  className="aspect-[16/10] w-full rounded-[1rem] border object-cover"
                />
              ) : null}

              <div className="flex flex-wrap gap-2">
                <LinkButton href={`/dashboard/projects/${createdProject.id}`} size="sm">
                  Manage project
                </LinkButton>
                {createdProject.status === PROJECT_STATUS.published ? (
                  <LinkButton href={`/projects/${createdProject.slug}`} variant="outline" size="sm" animated>
                    View listing
                    <Sparkles data-icon="inline-end" />
                  </LinkButton>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed bg-muted/15 p-5">
              <div className="text-sm font-medium">No submission yet</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete the wizard and we will create the listing right away, then keep this panel updated while the screenshot is processing.
              </p>
            </div>
          )}

          <div className="rounded-[1.2rem] border bg-background p-5">
            <div className="text-sm font-medium">What gets published</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <p>The public card leads with the screenshot, then the project story, AI stack, and tags.</p>
              <p>Projects stay out of the public gallery until the preview is ready, so the catalog never looks half-finished.</p>
              <p>Hostname verification stays optional and lives on the project management page after creation.</p>
              <p>
                Need a different route?{" "}
                <Link href="/submit" className="font-medium text-foreground hover:underline">
                  `/submit`
                </Link>{" "}
                points here for authenticated users.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/30">
          <LinkButton href="/dashboard/projects" variant="ghost" size="sm">
            Review all submissions
            <ExternalLink data-icon="inline-end" />
          </LinkButton>
        </CardFooter>
      </Card>
    </div>
  )
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium leading-6">{value}</div>
    </div>
  )
}
