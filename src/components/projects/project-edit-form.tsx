"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { ProjectStructuredFields } from "@/components/projects/project-structured-fields"
import { TokenField } from "@/components/projects/token-field"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AI_TOOL_SUGGESTIONS,
  PROJECT_TAG_SUGGESTIONS,
  type ProjectUpdatePayload,
  type SubmissionFieldErrors,
} from "@/lib/projects/types"

type EditableProject = {
  id: string
  name: string
  shortDescription: string
  appUrl: string
  repositoryUrl: string | null
  aiTools: string[]
  tags: string[]
  primaryUseCase: string | null
  buyerType: string | null
  interactionModel: string | null
  pricingVisibility: string | null
  deploymentSurface: string | null
  modelVendorMix: string | null
}

export function ProjectEditForm({ project }: { project: EditableProject }) {
  const router = useRouter()
  const [form, setForm] = useState<ProjectUpdatePayload>({
    name: project.name,
    shortDescription: project.shortDescription,
    appUrl: project.appUrl,
    repositoryUrl: project.repositoryUrl ?? "",
    aiTools: project.aiTools,
    tags: project.tags,
    primaryUseCase: project.primaryUseCase ?? undefined,
    buyerType: project.buyerType ?? undefined,
    interactionModel: project.interactionModel ?? undefined,
    pricingVisibility: project.pricingVisibility ?? undefined,
    deploymentSurface: project.deploymentSurface ?? undefined,
    modelVendorMix: project.modelVendorMix ?? undefined,
  })
  const [fieldErrors, setFieldErrors] = useState<SubmissionFieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateField<Key extends keyof ProjectUpdatePayload>(
    key: Key,
    value: ProjectUpdatePayload[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }))
  }

  function handleSubmit() {
    setMessage(null)
    setFieldErrors({})

    startTransition(() => {
      void saveProject()
    })
  }

  async function saveProject() {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    })

    const payload = (await response.json()) as
      | {
          ok: true
          message: string
          project: EditableProject
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

    if (!response.ok) {
      setMessage(payload.message)
      return
    }

    setForm({
      name: payload.project.name,
      shortDescription: payload.project.shortDescription,
      appUrl: payload.project.appUrl,
      repositoryUrl: payload.project.repositoryUrl ?? "",
      aiTools: payload.project.aiTools,
      tags: payload.project.tags,
      primaryUseCase: payload.project.primaryUseCase ?? undefined,
      buyerType: payload.project.buyerType ?? undefined,
      interactionModel: payload.project.interactionModel ?? undefined,
      pricingVisibility: payload.project.pricingVisibility ?? undefined,
      deploymentSurface: payload.project.deploymentSurface ?? undefined,
      modelVendorMix: payload.project.modelVendorMix ?? undefined,
    })
    setMessage(payload.message)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <FieldGroup className="grid gap-5">
        <Field>
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <Input
            id="project-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="project-description">Short description</FieldLabel>
          <Textarea
            id="project-description"
            value={form.shortDescription}
            onChange={(event) => updateField("shortDescription", event.target.value)}
            rows={6}
          />
          <div className="text-right text-xs text-muted-foreground">
            {form.shortDescription.length}/220
          </div>
          {fieldErrors.shortDescription ? (
            <FieldError>{fieldErrors.shortDescription}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="project-app-url">Application URL</FieldLabel>
          <Input
            id="project-app-url"
            type="url"
            value={form.appUrl}
            onChange={(event) => updateField("appUrl", event.target.value)}
          />
          <FieldDescription>
            Changing the URL restarts screenshot processing. If the hostname changes, ownership
            verification is reset and a new meta tag token is generated.
          </FieldDescription>
          {fieldErrors.appUrl ? <FieldError>{fieldErrors.appUrl}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="project-repo-url">Repository URL</FieldLabel>
          <Input
            id="project-repo-url"
            type="url"
            value={form.repositoryUrl ?? ""}
            onChange={(event) => updateField("repositoryUrl", event.target.value)}
            placeholder="Optional"
          />
          {fieldErrors.repositoryUrl ? <FieldError>{fieldErrors.repositoryUrl}</FieldError> : null}
        </Field>
      </FieldGroup>

      <TokenField
        label="AI tools used"
        description="Keep the stack focused so the public listing stays readable."
        value={form.aiTools}
        onChange={(value) => updateField("aiTools", value)}
        suggestions={AI_TOOL_SUGGESTIONS}
        error={fieldErrors.aiTools}
      />

      <TokenField
        label="Tags and categories"
        description="These drive discovery in the gallery and on the public card."
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

      {message ? (
        <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {message}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <p className="text-sm text-muted-foreground">
          Text-only edits keep the current preview. URL edits keep the old screenshot visible until a
          new one lands.
        </p>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
