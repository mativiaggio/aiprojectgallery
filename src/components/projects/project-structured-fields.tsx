"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  BUYER_TYPE_OPTIONS,
  DEPLOYMENT_SURFACE_OPTIONS,
  INTERACTION_MODEL_OPTIONS,
  MODEL_VENDOR_MIX_OPTIONS,
  PRICING_VISIBILITY_OPTIONS,
  PRIMARY_USE_CASE_OPTIONS,
  type SubmissionFieldErrors,
  type SubmissionPayload,
} from "@/lib/projects/types"

type StructuredFieldKey =
  | "primaryUseCase"
  | "buyerType"
  | "interactionModel"
  | "pricingVisibility"
  | "deploymentSurface"
  | "modelVendorMix"

type ProjectStructuredFieldsProps = {
  value: Pick<
    SubmissionPayload,
    | "primaryUseCase"
    | "buyerType"
    | "interactionModel"
    | "pricingVisibility"
    | "deploymentSurface"
    | "modelVendorMix"
  >
  onChange: <Key extends StructuredFieldKey>(
    key: Key,
    value: SubmissionPayload[Key]
  ) => void
  errors?: SubmissionFieldErrors
}

export function ProjectStructuredFields({
  value,
  onChange,
  errors,
}: ProjectStructuredFieldsProps) {
  return (
    <FieldGroup className="grid gap-5">
      <StructuredField
        label="Primary use case"
        description="This is the lens researchers should use first."
        options={PRIMARY_USE_CASE_OPTIONS}
        value={value.primaryUseCase ?? ""}
        onChange={(next) => onChange("primaryUseCase", next)}
        error={errors?.primaryUseCase}
      />
      <StructuredField
        label="Buyer type"
        description="Choose the audience most likely to evaluate or buy the product."
        options={BUYER_TYPE_OPTIONS}
        value={value.buyerType ?? ""}
        onChange={(next) => onChange("buyerType", next)}
        error={errors?.buyerType}
      />
      <StructuredField
        label="Interaction model"
        description="How people mainly experience the product."
        options={INTERACTION_MODEL_OPTIONS}
        value={value.interactionModel ?? ""}
        onChange={(next) => onChange("interactionModel", next)}
        error={errors?.interactionModel}
      />
      <StructuredField
        label="Pricing visibility"
        description="How visible the commercial model is to a first-time visitor."
        options={PRICING_VISIBILITY_OPTIONS}
        value={value.pricingVisibility ?? ""}
        onChange={(next) => onChange("pricingVisibility", next)}
        error={errors?.pricingVisibility}
      />
      <StructuredField
        label="Deployment surface"
        description="Where the product primarily lives today."
        options={DEPLOYMENT_SURFACE_OPTIONS}
        value={value.deploymentSurface ?? ""}
        onChange={(next) => onChange("deploymentSurface", next)}
        error={errors?.deploymentSurface}
      />
      <StructuredField
        label="Model vendor mix"
        description="Use the clearest label for the product's model posture."
        options={MODEL_VENDOR_MIX_OPTIONS}
        value={value.modelVendorMix ?? ""}
        onChange={(next) => onChange("modelVendorMix", next)}
        error={errors?.modelVendorMix}
      />
    </FieldGroup>
  )
}

function StructuredField({
  label,
  description,
  options,
  value,
  onChange,
  error,
}: {
  label: string
  description: string
  options: readonly string[]
  value: string
  onChange: (value: string | undefined) => void
  error?: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option

          return (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              onClick={() => onChange(selected ? undefined : option)}
            >
              {option}
            </Button>
          )
        })}
      </div>
      {error ? <div className="mt-2 text-sm text-destructive">{error}</div> : null}
    </Field>
  )
}
