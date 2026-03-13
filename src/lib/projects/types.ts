export { AI_TOOL_SUGGESTIONS } from "@/lib/projects/ai-tools"
export {
  BUYER_TYPE_OPTIONS,
  DEPLOYMENT_SURFACE_OPTIONS,
  INTERACTION_MODEL_OPTIONS,
  MODEL_VENDOR_MIX_OPTIONS,
  PRICING_VISIBILITY_OPTIONS,
  PRIMARY_USE_CASE_OPTIONS,
} from "@/lib/research/constants"

export const PROJECT_STATUS = {
  processing: "processing",
  published: "published",
  failed: "failed",
} as const

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

export type SubmissionPayload = {
  name: string
  shortDescription: string
  appUrl: string
  repositoryUrl?: string
  aiTools: string[]
  tags: string[]
  primaryUseCase?: string
  buyerType?: string
  interactionModel?: string
  pricingVisibility?: string
  deploymentSurface?: string
  modelVendorMix?: string
}

export type ProjectUpdatePayload = SubmissionPayload

export type ProjectOwnershipState = {
  verified: boolean
  verificationToken: string
  verificationMetaTag: string
  verifiedAt: Date | null
  verificationLastCheckedAt: Date | null
  verificationError: string | null
}

export type SubmissionFieldErrors = Partial<
  Record<
    | "name"
    | "shortDescription"
    | "appUrl"
    | "repositoryUrl"
    | "aiTools"
    | "tags"
    | "primaryUseCase"
    | "buyerType"
    | "interactionModel"
    | "pricingVisibility"
    | "deploymentSurface"
    | "modelVendorMix",
    string
  >
>

export type SubmissionResult =
  | {
      ok: true
      project: {
        id: string
        slug: string
        name: string
        status: ProjectStatus
        screenshotUrl: string | null
        processingError: string | null
      }
    }
  | {
      ok: false
      message: string
      fieldErrors?: SubmissionFieldErrors
    }

export const PROJECT_TAG_SUGGESTIONS = [
  "Productivity",
  "Creative tooling",
  "Knowledge",
  "Operations",
  "Customer support",
  "Developer tools",
  "Education",
  "Marketing",
  "Sales",
  "Research",
] as const
