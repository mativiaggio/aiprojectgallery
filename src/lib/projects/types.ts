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
    "name" | "shortDescription" | "appUrl" | "repositoryUrl" | "aiTools" | "tags",
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

export const AI_TOOL_SUGGESTIONS = [
  "GPT-4.1",
  "GPT-4o",
  "o3-mini",
  "Claude 3.7 Sonnet",
  "Claude 3.5 Sonnet",
  "Gemini 2.5 Pro",
  "Flux Pro",
  "Midjourney",
  "Runway",
  "ElevenLabs",
] as const

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
