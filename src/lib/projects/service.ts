import { randomBytes } from "node:crypto"

import { revalidatePath } from "next/cache"
import { and, desc, eq, isNotNull, ne } from "drizzle-orm"
import { UTApi } from "uploadthing/server"

import { db } from "@/lib/db"
import { projects, user } from "@/lib/db/schema"
import { env } from "@/lib/env"
import { captureAndUploadScreenshot } from "@/lib/projects/screenshot"
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
  status: projects.status,
  screenshotUrl: projects.screenshotUrl,
  screenshotFileKey: projects.screenshotFileKey,
  screenshotCapturedAt: projects.screenshotCapturedAt,
  processingError: projects.processingError,
  verified: projects.verified,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  publishedAt: projects.publishedAt,
  userId: projects.userId,
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
  status: string
  screenshotUrl: string | null
  screenshotFileKey: string | null
  screenshotCapturedAt: Date | null
  processingError: string | null
  verified: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  userId: string
  authorName: string
  authorEmail: string
}

type OwnerProject = ProjectListItem & ProjectOwnershipState

type ProjectUpdateResult = {
  project: OwnerProject
  appUrlChanged: boolean
  hostnameChanged: boolean
}

type ProjectVerificationResult = {
  project: OwnerProject
  message: string
}

export async function createSubmissionForUser(
  userId: string,
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
    status: PROJECT_STATUS.processing,
    processingError: null,
    verificationToken: generateVerificationToken(),
    verified: false,
    verificationError: null,
    createdAt: now,
    updatedAt: now,
    userId,
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

export async function retryProjectProcessing(projectId: string, userId: string) {
  const currentProject = await getProjectForOwner(projectId, userId)

  if (!currentProject) {
    return null
  }

  await db
    .update(projects)
    .set({
      status: PROJECT_STATUS.processing,
      processingError: null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))

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
  }
}

export async function updateProjectForOwner(
  projectId: string,
  userId: string,
  payload: ProjectUpdatePayload
): Promise<ProjectUpdateResult | FailedSubmissionResult | null> {
  const currentProject = await getProjectForOwner(projectId, userId)

  if (!currentProject) {
    return null
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
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))

  const updatedProject = await getProjectForOwner(projectId, userId)

  if (!updatedProject) {
    return null
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

export async function deleteProjectForOwner(projectId: string, userId: string) {
  const currentProject = await getProjectForOwner(projectId, userId)

  if (!currentProject) {
    return null
  }

  await deleteScreenshotFile(currentProject.screenshotFileKey)

  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))

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
  userId: string
): Promise<ProjectVerificationResult | null> {
  const currentProject = await getProjectForOwner(projectId, userId)

  if (!currentProject) {
    return null
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
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
  } else {
    await db
      .update(projects)
      .set({
        verified: false,
        verificationLastCheckedAt: now,
        verificationError: verificationOutcome.message,
        updatedAt: now,
      })
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
  }

  const updatedProject = await getProjectForOwner(projectId, userId)

  if (!updatedProject) {
    return null
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

    await deleteScreenshotFile(currentProject.screenshotFileKey)

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

export async function getUserProjects(userId: string) {
  const result = await db
    .select(projectBaseSelection)
    .from(projects)
    .innerJoin(user, eq(projects.userId, user.id))
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))

  return result.map((project) => ({
    ...project,
    verified: project.verified,
  }))
}

export async function getProjectForOwner(projectId: string, userId: string) {
  const result = await db
    .select(projectOwnerSelection)
    .from(projects)
    .innerJoin(user, eq(projects.userId, user.id))
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1)

  const project = result[0]

  return project ? withVerificationMetaTag(project) : null
}

export async function getPublishedProjects(limit = 12) {
  return db
    .select(projectBaseSelection)
    .from(projects)
    .innerJoin(user, eq(projects.userId, user.id))
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
    .innerJoin(user, eq(projects.userId, user.id))
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
  project: Omit<OwnerProject, "verificationMetaTag">
): OwnerProject {
  return {
    ...project,
    verificationMetaTag: buildVerificationMetaTag(project.verificationToken),
  }
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
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/projects")
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

async function checkProjectOwnership(
  project: OwnerProject
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
