import { randomBytes } from "node:crypto"

import { revalidatePath } from "next/cache"
import { and, desc, eq, isNotNull, ne } from "drizzle-orm"
import { UTApi } from "uploadthing/server"

import { db } from "@/lib/db"
import { projectSnapshots, projects, user } from "@/lib/db/schema"
import { env } from "@/lib/env"
import { canManageProject } from "@/lib/organizations/access"
import { captureAndUploadScreenshot } from "@/lib/projects/screenshot"
import {
  getProjectCollectionSummary,
  getProjectFeatureGapSummary,
  queueProjectResearchAnalysis,
  runProjectResearchNow,
} from "@/lib/research/service"
import {
  PROJECT_STATUS,
  type ProjectOwnershipState,
  type ProjectUpdatePayload,
  type SubmissionPayload,
  type SubmissionResult,
} from "@/lib/projects/types"
import {
  createProjectSlug,
  getHostnameFromUrl,
  validateProjectUpdatePayload,
  validateSubmissionPayload,
} from "@/lib/projects/validation"

const projectBaseSelection = {
  id: projects.id,
  slug: projects.slug,
  name: projects.name,
  shortDescription: projects.shortDescription,
  appUrl: projects.appUrl,
  normalizedAppUrl: projects.normalizedAppUrl,
  repositoryUrl: projects.repositoryUrl,
  aiTools: projects.aiTools,
  tags: projects.tags,
  primaryUseCase: projects.primaryUseCase,
  buyerType: projects.buyerType,
  interactionModel: projects.interactionModel,
  pricingVisibility: projects.pricingVisibility,
  deploymentSurface: projects.deploymentSurface,
  modelVendorMix: projects.modelVendorMix,
  status: projects.status,
  screenshotUrl: projects.screenshotUrl,
  screenshotFileKey: projects.screenshotFileKey,
  screenshotCapturedAt: projects.screenshotCapturedAt,
  processingError: projects.processingError,
  verified: projects.verified,
  credibilityScore: projects.credibilityScore,
  credibilitySummary: projects.credibilitySummary,
  lastAnalyzedAt: projects.lastAnalyzedAt,
  nextPulseDueAt: projects.nextPulseDueAt,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  publishedAt: projects.publishedAt,
  organizationId: projects.organizationId,
  createdByUserId: projects.createdByUserId,
  authorName: user.name,
  authorEmail: user.email,
}

const projectOwnerSelection = {
  ...projectBaseSelection,
  verificationToken: projects.verificationToken,
  verifiedAt: projects.verifiedAt,
  verificationLastCheckedAt: projects.verificationLastCheckedAt,
  verificationError: projects.verificationError,
}

type FailedSubmissionResult = Extract<SubmissionResult, { ok: false }>

type ProjectListItem = {
  id: string
  slug: string
  name: string
  shortDescription: string
  appUrl: string
  normalizedAppUrl: string
  repositoryUrl: string | null
  aiTools: string[]
  tags: string[]
  primaryUseCase: string | null
  buyerType: string | null
  interactionModel: string | null
  pricingVisibility: string | null
  deploymentSurface: string | null
  modelVendorMix: string | null
  status: string
  screenshotUrl: string | null
  screenshotFileKey: string | null
  screenshotCapturedAt: Date | null
  processingError: string | null
  verified: boolean
  credibilityScore: number
  credibilitySummary: string | null
  lastAnalyzedAt: Date | null
  nextPulseDueAt: Date | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  organizationId: string
  createdByUserId: string
  authorName: string
  authorEmail: string
  collectionCount: number
  linkedCollections: Array<{
    id: string
    name: string
    containsProject: boolean
  }>
  featureGapCount: number
  topFeatureGap: {
    title: string
    impact: string
    confidence: number
  } | null
  canManage: boolean
}

type WorkspaceProject = ProjectListItem & ProjectOwnershipState

type ProjectUpdateResult = {
  project: WorkspaceProject
  appUrlChanged: boolean
  hostnameChanged: boolean
}

type ProjectVerificationResult = {
  project: WorkspaceProject
  message: string
}

type ProjectActor = {
  organizationId: string
  userId: string
  role: string
}

type ProjectAccessError = {
  error: "not-found" | "forbidden"
}

export async function createSubmissionForOrganization(
  actor: ProjectActor,
  payload: SubmissionPayload
): Promise<SubmissionResult> {
  const validation = await validateSubmissionPayload(payload)

  if (!validation.ok) {
    return validation
  }

  const duplicate = await db
    .select({
      id: projects.id,
      name: projects.name,
    })
    .from(projects)
    .where(eq(projects.normalizedAppUrl, validation.data.normalizedAppUrl))
    .limit(1)

  if (duplicate.length > 0) {
    return {
      ok: false,
      message: "That project is already part of the gallery.",
      fieldErrors: {
        appUrl: `We already have a submission for ${duplicate[0].name}.`,
      },
    }
  }

  const projectId = crypto.randomUUID()
  const slug = createProjectSlug(validation.data.name)
  const now = new Date()

  await db.insert(projects).values({
    id: projectId,
    slug,
    name: validation.data.name,
    shortDescription: validation.data.shortDescription,
    appUrl: validation.data.appUrl,
    normalizedAppUrl: validation.data.normalizedAppUrl,
    repositoryUrl: validation.data.repositoryUrl,
    aiTools: validation.data.aiTools,
    tags: validation.data.tags,
    primaryUseCase: validation.data.primaryUseCase,
    buyerType: validation.data.buyerType,
    interactionModel: validation.data.interactionModel,
    pricingVisibility: validation.data.pricingVisibility,
    deploymentSurface: validation.data.deploymentSurface,
    modelVendorMix: validation.data.modelVendorMix,
    status: PROJECT_STATUS.processing,
    processingError: null,
    verificationToken: generateVerificationToken(),
    verified: false,
    verificationError: null,
    createdAt: now,
    updatedAt: now,
    organizationId: actor.organizationId,
    createdByUserId: actor.userId,
  })

  revalidateProjectSurfaces({ slug, projectId })

  return {
    ok: true,
    project: {
      id: projectId,
      slug,
      name: validation.data.name,
      status: PROJECT_STATUS.processing,
      screenshotUrl: null,
      processingError: null,
    },
  }
}

export async function retryProjectProcessing(
  projectId: string,
  actor: ProjectActor
): Promise<
  | ProjectAccessError
  | {
      id: string
      slug: string
      name: string
      status: string
      screenshotUrl: string | null
      processingError: string | null
      verified: boolean
      canManage: boolean
    }
> {
  const currentProject = await getProjectForWorkspace(projectId, actor)

  if (!currentProject) {
    return {
      error: "not-found",
    }
  }

  if (!currentProject.canManage) {
    return {
      error: "forbidden",
    }
  }

  await db
    .update(projects)
    .set({
      status: PROJECT_STATUS.processing,
      processingError: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, actor.organizationId)
      )
    )

  revalidateProjectSurfaces({
    slug: currentProject.slug,
    projectId: currentProject.id,
  })

  return {
    id: currentProject.id,
    slug: currentProject.slug,
    name: currentProject.name,
    status: PROJECT_STATUS.processing,
    screenshotUrl: currentProject.screenshotUrl,
    processingError: null,
    verified: currentProject.verified,
    canManage: true,
  }
}

export async function updateProjectForOwner(
  projectId: string,
  actor: ProjectActor,
  payload: ProjectUpdatePayload
): Promise<ProjectUpdateResult | FailedSubmissionResult | ProjectAccessError> {
  const currentProject = await getProjectForWorkspace(projectId, actor)

  if (!currentProject) {
    return {
      error: "not-found",
    }
  }

  if (!currentProject.canManage) {
    return {
      error: "forbidden",
    }
  }

  const validation = await validateProjectUpdatePayload(payload)

  if (!validation.ok) {
    return validation
  }

  const duplicate = await db
    .select({
      id: projects.id,
      name: projects.name,
    })
    .from(projects)
    .where(
      and(
        eq(projects.normalizedAppUrl, validation.data.normalizedAppUrl),
        ne(projects.id, projectId)
      )
    )
    .limit(1)

  if (duplicate.length > 0) {
    return {
      ok: false,
      message: "That project is already part of the gallery.",
      fieldErrors: {
        appUrl: `We already have a submission for ${duplicate[0].name}.`,
      },
    }
  }

  const currentHostname = getHostnameFromUrl(currentProject.normalizedAppUrl)
  const nextHostname = getHostnameFromUrl(validation.data.normalizedAppUrl)
  const hostnameChanged = currentHostname !== nextHostname
  const appUrlChanged =
    currentProject.normalizedAppUrl !== validation.data.normalizedAppUrl

  await db
    .update(projects)
    .set({
      name: validation.data.name,
      shortDescription: validation.data.shortDescription,
      appUrl: validation.data.appUrl,
      normalizedAppUrl: validation.data.normalizedAppUrl,
      repositoryUrl: validation.data.repositoryUrl,
      aiTools: validation.data.aiTools,
      tags: validation.data.tags,
      primaryUseCase: validation.data.primaryUseCase,
      buyerType: validation.data.buyerType,
      interactionModel: validation.data.interactionModel,
      pricingVisibility: validation.data.pricingVisibility,
      deploymentSurface: validation.data.deploymentSurface,
      modelVendorMix: validation.data.modelVendorMix,
      ...(appUrlChanged
        ? {
            status: PROJECT_STATUS.processing,
            processingError: null,
          }
        : {}),
      ...(hostnameChanged
        ? {
            verificationToken: generateVerificationToken(),
            verified: false,
            verifiedAt: null,
            verificationLastCheckedAt: null,
            verificationError: null,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, actor.organizationId)
      )
    )

  const updatedProject = await getProjectForWorkspace(projectId, actor)

  if (!updatedProject) {
    return {
      error: "not-found",
    }
  }

  revalidateProjectSurfaces({
    slug: updatedProject.slug,
    projectId: updatedProject.id,
  })

  return {
    project: updatedProject,
    appUrlChanged,
    hostnameChanged,
  }
}

export async function deleteProjectForWorkspace(
  projectId: string,
  actor: ProjectActor
): Promise<
  | ProjectAccessError
  | {
      id: string
      slug: string
      name: string
    }
> {
  const currentProject = await getProjectForWorkspace(projectId, actor)

  if (!currentProject) {
    return {
      error: "not-found",
    }
  }

  if (!currentProject.canManage) {
    return {
      error: "forbidden",
    }
  }

  await deleteProjectScreenshotFiles(projectId, currentProject.screenshotFileKey)

  await db
    .delete(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, actor.organizationId)
      )
    )

  revalidateProjectSurfaces({
    slug: currentProject.slug,
    projectId: currentProject.id,
  })

  return {
    id: currentProject.id,
    slug: currentProject.slug,
    name: currentProject.name,
  }
}

export async function verifyProjectOwnership(
  projectId: string,
  actor: ProjectActor
): Promise<ProjectVerificationResult | ProjectAccessError> {
  const currentProject = await getProjectForWorkspace(projectId, actor)

  if (!currentProject) {
    return {
      error: "not-found",
    }
  }

  if (!currentProject.canManage) {
    return {
      error: "forbidden",
    }
  }

  const now = new Date()
  const verificationOutcome = await checkProjectOwnership(currentProject)

  if (verificationOutcome.ok) {
    await db
      .update(projects)
      .set({
        verified: true,
        verifiedAt: now,
        verificationLastCheckedAt: now,
        verificationError: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, actor.organizationId)
        )
      )
  } else {
    await db
      .update(projects)
      .set({
        verified: false,
        verificationLastCheckedAt: now,
        verificationError: verificationOutcome.message,
        updatedAt: now,
      })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, actor.organizationId)
        )
      )
  }

  const updatedProject = await getProjectForWorkspace(projectId, actor)

  if (!updatedProject) {
    return {
      error: "not-found",
    }
  }

  revalidateProjectSurfaces({
    slug: updatedProject.slug,
    projectId: updatedProject.id,
  })

  return {
    project: updatedProject,
    message: verificationOutcome.message,
  }
}

export async function processProjectScreenshot(projectId: string) {
  const project = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      appUrl: projects.appUrl,
      screenshotFileKey: projects.screenshotFileKey,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (project.length === 0) {
    return
  }

  const currentProject = project[0]

  try {
    const uploadedScreenshot = await captureAndUploadScreenshot({
      appUrl: currentProject.appUrl,
      slug: currentProject.slug,
    })

    await db
      .update(projects)
      .set({
        status: PROJECT_STATUS.published,
        screenshotUrl: uploadedScreenshot.screenshotUrl,
        screenshotFileKey: uploadedScreenshot.screenshotFileKey,
        screenshotCapturedAt: new Date(),
        publishedAt: new Date(),
        processingError: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))

    const queuedRun = await queueProjectResearchAnalysis(projectId, "initial")
    await runProjectResearchNow(queuedRun.id, uploadedScreenshot).catch(() => null)
  } catch (error) {
    await db
      .update(projects)
      .set({
        status: PROJECT_STATUS.failed,
        processingError: getErrorMessage(error),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
  }

  revalidateProjectSurfaces({
    slug: currentProject.slug,
    projectId: currentProject.id,
  })
}

export async function getOrganizationProjects(actor: ProjectActor) {
  const result = await db
    .select(projectBaseSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .where(eq(projects.organizationId, actor.organizationId))
    .orderBy(desc(projects.createdAt))

  return withResearchMetadata(result, actor)
}

export async function getProjectForWorkspace(
  projectId: string,
  actor: ProjectActor
) {
  const result = await db
    .select(projectOwnerSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, actor.organizationId)
      )
    )
    .limit(1)

  const project = result[0]

  if (!project) {
    return null
  }

  const [withResearchState] = await withResearchMetadata([project], actor)

  return withResearchState ? withVerificationMetaTag(withResearchState) : null
}

export async function getPublishedProjects(limit = 12) {
  return db
    .select(projectBaseSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .where(
      and(
        eq(projects.status, PROJECT_STATUS.published),
        isNotNull(projects.screenshotUrl)
      )
    )
    .orderBy(desc(projects.publishedAt), desc(projects.createdAt))
    .limit(limit)
}

export async function getPublishedProjectBySlug(slug: string) {
  const result = await db
    .select(projectBaseSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .where(
      and(
        eq(projects.slug, slug),
        eq(projects.status, PROJECT_STATUS.published),
        isNotNull(projects.screenshotUrl)
      )
    )
    .limit(1)

  return result[0] ?? null
}

function withVerificationMetaTag(
  project: Omit<WorkspaceProject, "verificationMetaTag">
): WorkspaceProject {
  return {
    ...project,
    verificationMetaTag: buildVerificationMetaTag(project.verificationToken),
  }
}

async function withResearchMetadata<T extends { id: string; createdByUserId: string }>(
  projectList: T[],
  actor: ProjectActor
) {
  const projectIds = projectList.map((project) => project.id)
  const [collectionSummary, featureGapSummary] = await Promise.all([
    getProjectCollectionSummary(actor.userId, projectIds),
    getProjectFeatureGapSummary(projectIds),
  ])

  return projectList.map((project) => {
    const managementState = withManagementState(project, actor)
    const collections = collectionSummary[project.id] ?? {
      collectionCount: 0,
      linkedCollections: [],
    }
    const featureGaps = featureGapSummary[project.id] ?? {
      featureGapCount: 0,
      topFeatureGap: null,
    }

    return {
      ...managementState,
      ...collections,
      ...featureGaps,
    }
  })
}

function buildVerificationMetaTag(token: string) {
  return `<meta name="ai-project-gallery-verification" content="${token}">`
}

function generateVerificationToken() {
  return randomBytes(24).toString("hex")
}

function revalidateProjectSurfaces({
  slug,
  projectId,
}: {
  slug: string
  projectId: string
}) {
  revalidatePath("/")
  revalidatePath("/submit")
  revalidatePath("/research")
  revalidatePath("/compare")
  revalidatePath("/pulse")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/projects")
  revalidatePath("/dashboard/collections")
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard/submissions")
  revalidatePath(`/projects/${slug}`)
}

async function deleteScreenshotFile(fileKey: string | null) {
  if (!fileKey || !env.UPLOADTHING_TOKEN) {
    return
  }

  await new UTApi({ token: env.UPLOADTHING_TOKEN })
    .deleteFiles(fileKey)
    .catch(() => null)
}

async function deleteProjectScreenshotFiles(projectId: string, currentFileKey: string | null) {
  const snapshotKeys = await db
    .select({
      screenshotFileKey: projectSnapshots.screenshotFileKey,
    })
    .from(projectSnapshots)
    .where(eq(projectSnapshots.projectId, projectId))

  const fileKeys = [...new Set([currentFileKey, ...snapshotKeys.map((entry) => entry.screenshotFileKey)].filter(Boolean))]

  for (const fileKey of fileKeys) {
    await deleteScreenshotFile(fileKey ?? null)
  }
}

async function checkProjectOwnership(
  project: WorkspaceProject
): Promise<
  | {
      ok: true
      message: string
    }
  | {
      ok: false
      message: string
    }
> {
  const expectedHostname = getHostnameFromUrl(project.normalizedAppUrl)

  try {
    const response = await fetch(project.appUrl, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: `The site responded with ${response.status} ${response.statusText}.`,
      }
    }

    const finalHostname = getHostnameFromUrl(response.url)

    if (finalHostname !== expectedHostname) {
      return {
        ok: false,
        message: `The URL redirected to ${finalHostname}, but the project is registered on ${expectedHostname}.`,
      }
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""

    if (!contentType.includes("text/html")) {
      return {
        ok: false,
        message: "The submitted URL did not return an HTML document.",
      }
    }

    const html = await response.text()
    const metaTagContent = findMetaTagContent(
      html,
      "ai-project-gallery-verification"
    )

    if (!metaTagContent) {
      return {
        ok: false,
        message: "The verification meta tag was not found on the page.",
      }
    }

    if (metaTagContent !== project.verificationToken) {
      return {
        ok: false,
        message: "The verification meta tag was found, but the token does not match this project.",
      }
    }

    return {
      ok: true,
      message: "Ownership verified for this hostname.",
    }
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        ok: false,
        message: "The verification request timed out before the site responded.",
      }
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? getErrorMessage(error)
          : "The ownership check could not be completed.",
    }
  }
}

function findMetaTagContent(html: string, targetName: string) {
  const metaTagMatches = html.match(/<meta\b[^>]*>/gi)

  if (!metaTagMatches) {
    return null
  }

  for (const metaTag of metaTagMatches) {
    const nameValue = getHtmlAttribute(metaTag, "name")

    if (!nameValue || nameValue.toLowerCase() !== targetName.toLowerCase()) {
      continue
    }

    return getHtmlAttribute(metaTag, "content")
  }

  return null
}

function getHtmlAttribute(tag: string, attributeName: string) {
  const attributePattern = new RegExp(
    `${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\\\`]+))`,
    "i"
  )
  const match = attributePattern.exec(tag)

  if (!match) {
    return null
  }

  return match[1] ?? match[2] ?? match[3] ?? null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 240)
  }

  return "Something went wrong while generating the screenshot."
}

function withManagementState<T extends { createdByUserId: string }>(
  project: T,
  actor: ProjectActor
): T & { canManage: boolean } {
  return {
    ...project,
    canManage: canManageProject({
      role: actor.role,
      createdByUserId: project.createdByUserId,
      userId: actor.userId,
    }),
  }
}
