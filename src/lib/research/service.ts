import { createHash, randomBytes } from "node:crypto"

import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  gte,
} from "drizzle-orm"

import { db } from "@/lib/db"
import {
  collectionItems,
  marketMapMemberships,
  marketMaps,
  narrativeEvents,
  opportunityClusters,
  productClaims,
  projectAnalysisRuns,
  projectChanges,
  projectEvidenceItems,
  projectFeatureGaps,
  projectPeerSets,
  projects,
  projectSignals,
  projectSnapshotPages,
  projectSnapshots,
  projectTaxonomyTerms,
  radarTargets,
  researchCollections,
  taxonomyTerms,
  user,
  userProfiles,
} from "@/lib/db/schema"
import { sendWeeklyDigestEmail } from "@/lib/email"
import { env } from "@/lib/env"
import { captureAndUploadScreenshot } from "@/lib/projects/screenshot"
import { PROJECT_STATUS } from "@/lib/projects/types"
import { createProjectSlug, getHostnameFromUrl, normalizePublicUrl } from "@/lib/projects/validation"
import { DEFAULT_MARKET_MAPS, DEFAULT_TAXONOMY_TERMS } from "@/lib/research/constants"
import {
  runDeepResearchAnalysis,
  type AnalysisRunTrigger,
  type DeepAnalysisProject,
  type DeepAnalysisResult,
} from "@/lib/research/deep-analysis"
import {
  extractHeadings,
  extractLinks,
  extractMetaContent,
  extractTitle,
  normalizeSet,
  slugifyTerm,
  stripHtml,
  summarizeList,
} from "@/lib/research/utils"

type ProjectWithSignalsRow = {
  id: string
  slug: string
  name: string
  shortDescription: string
  appUrl: string
  normalizedAppUrl: string
  repositoryUrl: string | null
  status: string
  aiTools: string[]
  tags: string[]
  primaryUseCase: string | null
  buyerType: string | null
  interactionModel: string | null
  pricingVisibility: string | null
  deploymentSurface: string | null
  modelVendorMix: string | null
  screenshotUrl: string | null
  screenshotFileKey: string | null
  screenshotCapturedAt: Date | null
  publishedAt: Date | null
  verified: boolean
  credibilityScore: number
  credibilitySummary: string | null
  lastAnalyzedAt: Date | null
  nextPulseDueAt: Date | null
  createdAt: Date
  createdByUserId: string
  authorName: string
  primaryHeadline: string | null
  researchSummary: string | null
  likelyIcp: string | null
  analysisMethod: string | null
  pagesVisited: number | null
  coverageScore: number | null
  marketClarityScore: number | null
  conversionScore: number | null
  trustScore: number | null
  technicalDepthScore: number | null
  proofScore: number | null
  freshnessScore: number | null
  pricingPageDetected: boolean | null
  docsDetected: boolean | null
  demoCtaDetected: boolean | null
  authWallDetected: boolean | null
  enterpriseCueDetected: boolean | null
  selfServeCueDetected: boolean | null
  proofPoints: string[] | null
  evidenceSnippets: string[] | null
  executiveAbstract: string | null
  forensicSummary: string | null
  methodologyNote: string | null
  confidenceScore: number | null
  comparisonNote: string | null
}

type ProjectCollectionSummary = {
  collectionCount: number
  linkedCollections: Array<{
    id: string
    name: string
    containsProject: boolean
  }>
}

type ProjectFeatureGapSummary = {
  featureGapCount: number
  topFeatureGap: {
    title: string
    impact: string
    confidence: number
  } | null
}

type GithubSignal = {
  recentlyUpdated: boolean
  signalText: string | null
}
type ResearchAnalysis = Omit<DeepAnalysisResult, "executiveAbstract" | "forensicSummary" | "methodologyNote" | "analysisMethod"> & {
  executiveAbstract?: string | null
  forensicSummary?: string | null
  methodologyNote?: string | null
  analysisMethod?: string
}

type ProjectAnalysisRunRow = {
  id: string
  projectId: string
  status: string
  trigger: string
  queuedAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  errorMessage: string | null
  pagesAttempted: number
  pagesSucceeded: number
  snapshotId: string | null
}

type RadarTargetRow = {
  id: string
  slug: string
  name: string
  appUrl: string
  normalizedAppUrl: string
  status: string
  source: string
  screenshotUrl: string | null
  screenshotFileKey: string | null
  screenshotCapturedAt: Date | null
  primaryUseCase: string | null
  buyerType: string | null
  interactionModel: string | null
  pricingVisibility: string | null
  deploymentSurface: string | null
  modelVendorMix: string | null
  primaryHeadline: string | null
  researchSummary: string | null
  likelyIcp: string | null
  comparisonNote: string | null
  pricingPageDetected: boolean
  docsDetected: boolean
  demoCtaDetected: boolean
  authWallDetected: boolean
  enterpriseCueDetected: boolean
  selfServeCueDetected: boolean
  integrationCueDetected: boolean
  collaborationCueDetected: boolean
  analyticsCueDetected: boolean
  apiSurfaceDetected: boolean
  compareSurfaceDetected: boolean
  proofPoints: string[]
  evidenceSnippets: string[]
  confidenceScore: number
  credibilityScore: number
  credibilitySummary: string | null
  firstDetectedAt: Date
  lastChangedAt: Date | null
  lastAnalyzedAt: Date | null
  nextPulseDueAt: Date | null
  needsClaim: boolean
  projectId: string | null
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
}

export type ResearchFilters = {
  query?: string
  primaryUseCase?: string
  buyerType?: string
  pricingVisibility?: string
  deploymentSurface?: string
  verifiedOnly?: boolean
}

const projectSelection = {
  id: projects.id,
  slug: projects.slug,
  name: projects.name,
  shortDescription: projects.shortDescription,
  appUrl: projects.appUrl,
  normalizedAppUrl: projects.normalizedAppUrl,
  repositoryUrl: projects.repositoryUrl,
  status: projects.status,
  aiTools: projects.aiTools,
  tags: projects.tags,
  primaryUseCase: projects.primaryUseCase,
  buyerType: projects.buyerType,
  interactionModel: projects.interactionModel,
  pricingVisibility: projects.pricingVisibility,
  deploymentSurface: projects.deploymentSurface,
  modelVendorMix: projects.modelVendorMix,
  screenshotUrl: projects.screenshotUrl,
  screenshotFileKey: projects.screenshotFileKey,
  screenshotCapturedAt: projects.screenshotCapturedAt,
  publishedAt: projects.publishedAt,
  verified: projects.verified,
  credibilityScore: projects.credibilityScore,
  credibilitySummary: projects.credibilitySummary,
  lastAnalyzedAt: projects.lastAnalyzedAt,
  nextPulseDueAt: projects.nextPulseDueAt,
  createdAt: projects.createdAt,
  createdByUserId: projects.createdByUserId,
  authorName: user.name,
  primaryHeadline: projectSignals.primaryHeadline,
  researchSummary: projectSignals.researchSummary,
  likelyIcp: projectSignals.likelyIcp,
  analysisMethod: projectSignals.analysisMethod,
  pagesVisited: projectSignals.pagesVisited,
  coverageScore: projectSignals.coverageScore,
  marketClarityScore: projectSignals.marketClarityScore,
  conversionScore: projectSignals.conversionScore,
  trustScore: projectSignals.trustScore,
  technicalDepthScore: projectSignals.technicalDepthScore,
  proofScore: projectSignals.proofScore,
  freshnessScore: projectSignals.freshnessScore,
  pricingPageDetected: projectSignals.pricingPageDetected,
  docsDetected: projectSignals.docsDetected,
  demoCtaDetected: projectSignals.demoCtaDetected,
  authWallDetected: projectSignals.authWallDetected,
  enterpriseCueDetected: projectSignals.enterpriseCueDetected,
  selfServeCueDetected: projectSignals.selfServeCueDetected,
  proofPoints: projectSignals.proofPoints,
  evidenceSnippets: projectSignals.evidenceSnippets,
  executiveAbstract: projectSignals.executiveAbstract,
  forensicSummary: projectSignals.forensicSummary,
  methodologyNote: projectSignals.methodologyNote,
  confidenceScore: projectSignals.confidenceScore,
  comparisonNote: projectSignals.comparisonNote,
}

const radarSelection = {
  id: radarTargets.id,
  slug: radarTargets.slug,
  name: radarTargets.name,
  appUrl: radarTargets.appUrl,
  normalizedAppUrl: radarTargets.normalizedAppUrl,
  status: radarTargets.status,
  source: radarTargets.source,
  screenshotUrl: radarTargets.screenshotUrl,
  screenshotFileKey: radarTargets.screenshotFileKey,
  screenshotCapturedAt: radarTargets.screenshotCapturedAt,
  primaryUseCase: radarTargets.primaryUseCase,
  buyerType: radarTargets.buyerType,
  interactionModel: radarTargets.interactionModel,
  pricingVisibility: radarTargets.pricingVisibility,
  deploymentSurface: radarTargets.deploymentSurface,
  modelVendorMix: radarTargets.modelVendorMix,
  primaryHeadline: radarTargets.primaryHeadline,
  researchSummary: radarTargets.researchSummary,
  likelyIcp: radarTargets.likelyIcp,
  comparisonNote: radarTargets.comparisonNote,
  pricingPageDetected: radarTargets.pricingPageDetected,
  docsDetected: radarTargets.docsDetected,
  demoCtaDetected: radarTargets.demoCtaDetected,
  authWallDetected: radarTargets.authWallDetected,
  enterpriseCueDetected: radarTargets.enterpriseCueDetected,
  selfServeCueDetected: radarTargets.selfServeCueDetected,
  integrationCueDetected: radarTargets.integrationCueDetected,
  collaborationCueDetected: radarTargets.collaborationCueDetected,
  analyticsCueDetected: radarTargets.analyticsCueDetected,
  apiSurfaceDetected: radarTargets.apiSurfaceDetected,
  compareSurfaceDetected: radarTargets.compareSurfaceDetected,
  proofPoints: radarTargets.proofPoints,
  evidenceSnippets: radarTargets.evidenceSnippets,
  confidenceScore: radarTargets.confidenceScore,
  credibilityScore: radarTargets.credibilityScore,
  credibilitySummary: radarTargets.credibilitySummary,
  firstDetectedAt: radarTargets.firstDetectedAt,
  lastChangedAt: radarTargets.lastChangedAt,
  lastAnalyzedAt: radarTargets.lastAnalyzedAt,
  nextPulseDueAt: radarTargets.nextPulseDueAt,
  needsClaim: radarTargets.needsClaim,
  projectId: radarTargets.projectId,
  createdByUserId: radarTargets.createdByUserId,
  createdAt: radarTargets.createdAt,
  updatedAt: radarTargets.updatedAt,
}

export async function ensureDefaultTaxonomyTerms() {
  for (const term of DEFAULT_TAXONOMY_TERMS) {
    await db
      .insert(taxonomyTerms)
      .values({
        id: `taxonomy_${term.slug}`,
        slug: term.slug,
        label: term.label,
        group: term.group,
      })
      .onConflictDoNothing()
  }
}

export async function ensureDefaultMarketMaps() {
  for (const map of DEFAULT_MARKET_MAPS) {
    await db
      .insert(marketMaps)
      .values({
        id: `market_map_${map.slug}`,
        slug: map.slug,
        title: map.title,
        summary: map.summary,
      })
      .onConflictDoNothing()
  }
}

async function getProjectAnalysisContext(projectId: string) {
  const project = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      name: projects.name,
      shortDescription: projects.shortDescription,
      appUrl: projects.appUrl,
      repositoryUrl: projects.repositoryUrl,
      aiTools: projects.aiTools,
      tags: projects.tags,
      primaryUseCase: projects.primaryUseCase,
      buyerType: projects.buyerType,
      interactionModel: projects.interactionModel,
      pricingVisibility: projects.pricingVisibility,
      deploymentSurface: projects.deploymentSurface,
      modelVendorMix: projects.modelVendorMix,
      screenshotUrl: projects.screenshotUrl,
      screenshotFileKey: projects.screenshotFileKey,
      screenshotCapturedAt: projects.screenshotCapturedAt,
      verified: projects.verified,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  return (project[0] ?? null) as (DeepAnalysisProject & {
    id: string
    slug: string
    screenshotUrl: string | null
    screenshotFileKey: string | null
  }) | null
}

export async function queueProjectResearchAnalysis(
  projectId: string,
  trigger: AnalysisRunTrigger = "manual"
) {
  const existing = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(
      and(
        eq(projectAnalysisRuns.projectId, projectId),
        or(eq(projectAnalysisRuns.status, "queued"), eq(projectAnalysisRuns.status, "running"))
      )
    )
    .orderBy(desc(projectAnalysisRuns.queuedAt))
    .limit(1)

  if (existing[0]) {
    return existing[0]
  }

  const runId = crypto.randomUUID()

  await db.insert(projectAnalysisRuns).values({
    id: runId,
    projectId,
    status: "queued",
    trigger,
    queuedAt: new Date(),
  })

  const [run] = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(eq(projectAnalysisRuns.id, runId))
    .limit(1)

  return run
}

export async function getLatestProjectAnalysisRun(projectId: string) {
  const [run] = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(eq(projectAnalysisRuns.projectId, projectId))
    .orderBy(desc(projectAnalysisRuns.queuedAt))
    .limit(1)

  return (run ?? null) as ProjectAnalysisRunRow | null
}

export async function getProjectAnalysisRuns(projectId: string, limit = 20) {
  return (await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(eq(projectAnalysisRuns.projectId, projectId))
    .orderBy(desc(projectAnalysisRuns.queuedAt))
    .limit(limit)) as ProjectAnalysisRunRow[]
}

export async function getOrganizationAnalysisQueue(organizationId: string) {
  const activeRuns = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
      projectSlug: projects.slug,
      projectName: projects.name,
      projectStatus: projects.status,
      nextPulseDueAt: projects.nextPulseDueAt,
      lastAnalyzedAt: projects.lastAnalyzedAt,
      organizationId: projects.organizationId,
    })
    .from(projectAnalysisRuns)
    .innerJoin(projects, eq(projects.id, projectAnalysisRuns.projectId))
    .where(or(eq(projectAnalysisRuns.status, "queued"), eq(projectAnalysisRuns.status, "running")))

  const orderedActiveRuns = activeRuns.sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "running" ? -1 : 1
    }

    const priorityDelta = analysisTriggerPriority(left.trigger) - analysisTriggerPriority(right.trigger)

    if (priorityDelta !== 0) {
      return priorityDelta
    }

    return left.queuedAt.getTime() - right.queuedAt.getTime()
  })

  const now = Date.now()
  const averageMinutesPerRun = 4
  const visibleActiveRuns = orderedActiveRuns
    .filter((run) => run.organizationId === organizationId)
    .map((run) => {
      const queuePosition = orderedActiveRuns.findIndex((entry) => entry.id === run.id) + 1
      const estimatedStartAt =
        run.status === "running"
          ? run.startedAt ?? run.queuedAt
          : new Date(now + Math.max(0, queuePosition - 1) * averageMinutesPerRun * 60_000)

      return {
        id: run.id,
        projectId: run.projectId,
        status: run.status,
        trigger: run.trigger,
        queuedAt: run.queuedAt,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        errorMessage: run.errorMessage,
        pagesAttempted: run.pagesAttempted,
        pagesSucceeded: run.pagesSucceeded,
        snapshotId: run.snapshotId,
        projectSlug: run.projectSlug,
        projectName: run.projectName,
        projectStatus: run.projectStatus,
        nextPulseDueAt: run.nextPulseDueAt,
        lastAnalyzedAt: run.lastAnalyzedAt,
        queuePosition,
        estimatedStartAt,
      }
    })

  const organizationProjects = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      name: projects.name,
      status: projects.status,
      nextPulseDueAt: projects.nextPulseDueAt,
      lastAnalyzedAt: projects.lastAnalyzedAt,
    })
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .orderBy(asc(projects.nextPulseDueAt), asc(projects.name))

  const activeProjectIds = new Set(visibleActiveRuns.map((run) => run.projectId))
  const upcomingProjects = organizationProjects
    .filter((project) => !activeProjectIds.has(project.id) && project.nextPulseDueAt)
    .slice(0, 20)

  return {
    activeRuns: visibleActiveRuns,
    upcomingProjects,
  }
}

async function processQueuedProjectResearch(limit = 8) {
  const queuedRuns = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(eq(projectAnalysisRuns.status, "queued"))
    .orderBy(asc(projectAnalysisRuns.queuedAt))
    .limit(limit * 3)

  const prioritized = queuedRuns
    .sort((left, right) => {
      const leftPriority = analysisTriggerPriority(left.trigger)
      const rightPriority = analysisTriggerPriority(right.trigger)

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return left.queuedAt.getTime() - right.queuedAt.getTime()
    })
    .slice(0, limit)

  for (const run of prioritized) {
    await processProjectAnalysisRun(run.id).catch(() => null)
  }

  return prioritized.length
}

async function processProjectAnalysisRun(
  runId: string,
  options?: {
    screenshotUrl?: string | null
    screenshotFileKey?: string | null
  }
) {
  const [run] = await db
    .select({
      id: projectAnalysisRuns.id,
      projectId: projectAnalysisRuns.projectId,
      status: projectAnalysisRuns.status,
      trigger: projectAnalysisRuns.trigger,
      queuedAt: projectAnalysisRuns.queuedAt,
      startedAt: projectAnalysisRuns.startedAt,
      finishedAt: projectAnalysisRuns.finishedAt,
      errorMessage: projectAnalysisRuns.errorMessage,
      pagesAttempted: projectAnalysisRuns.pagesAttempted,
      pagesSucceeded: projectAnalysisRuns.pagesSucceeded,
      snapshotId: projectAnalysisRuns.snapshotId,
    })
    .from(projectAnalysisRuns)
    .where(eq(projectAnalysisRuns.id, runId))
    .limit(1)

  if (!run || run.status !== "queued") {
    return null
  }

  const startedAt = new Date()

  await db
    .update(projectAnalysisRuns)
    .set({
      status: "running",
      startedAt,
      errorMessage: null,
    })
    .where(eq(projectAnalysisRuns.id, runId))

  try {
    const result = await analyzeProjectResearch(run.projectId, options)

    await db
      .update(projectAnalysisRuns)
      .set({
        status: "completed",
        finishedAt: new Date(),
        pagesAttempted: result?.analysis.pagesAttempted ?? 0,
        pagesSucceeded: result?.analysis.pagesVisited ?? 0,
        snapshotId: result?.snapshotId ?? null,
      })
      .where(eq(projectAnalysisRuns.id, runId))

    if (result?.snapshotId) {
      await db
        .update(projectSnapshots)
        .set({
          analysisRunId: runId,
        })
        .where(eq(projectSnapshots.id, result.snapshotId))
    }

    return result
  } catch (error) {
    await db
      .update(projectAnalysisRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Analysis failed",
      })
      .where(eq(projectAnalysisRuns.id, runId))

    throw error
  }
}

export async function runProjectResearchNow(
  runId: string,
  options?: {
    screenshotUrl?: string | null
    screenshotFileKey?: string | null
  }
) {
  return processProjectAnalysisRun(runId, options)
}

export async function runProjectAnalysisImmediately(projectId: string) {
  const currentRun = await getLatestProjectAnalysisRun(projectId)

  if (currentRun?.status === "running") {
    return {
      run: currentRun,
      alreadyRunning: true,
    }
  }

  const run =
    currentRun?.status === "queued"
      ? currentRun
      : await queueProjectResearchAnalysis(projectId, "manual")

  await processProjectAnalysisRun(run.id)

  return {
    run: await getLatestProjectAnalysisRun(projectId),
    alreadyRunning: false,
  }
}

function analysisTriggerPriority(trigger: string) {
  switch (trigger) {
    case "manual":
      return 0
    case "initial":
      return 1
    default:
      return 2
  }
}

async function persistProjectSnapshotArtifacts(
  snapshotId: string,
  analysis: DeepAnalysisResult,
  capturedAt: Date
) {
  await db.delete(projectEvidenceItems).where(eq(projectEvidenceItems.snapshotId, snapshotId))
  await db.delete(projectSnapshotPages).where(eq(projectSnapshotPages.snapshotId, snapshotId))

  const pageIdByUrl = new Map<string, string>()

  if (analysis.pages.length > 0) {
    await db.insert(projectSnapshotPages).values(
      analysis.pages.map((page) => {
        const pageId = crypto.randomUUID()
        pageIdByUrl.set(page.finalUrl, pageId)

        return {
          id: pageId,
          snapshotId,
          url: page.url,
          pageType: page.pageType,
          statusCode: page.statusCode,
          finalUrl: page.finalUrl,
          title: page.title,
          canonicalUrl: page.canonicalUrl,
          metaDescription: page.metaDescription,
          htmlHash: page.htmlHash,
          textHash: page.textHash,
          capturedAt,
        }
      })
    )
  }

  if (analysis.evidence.length > 0) {
    await db.insert(projectEvidenceItems).values(
      analysis.evidence.map((item) => ({
        id: crypto.randomUUID(),
        snapshotId,
        snapshotPageId: pageIdByUrl.get(item.sourceUrl) ?? null,
        category: item.category,
        signalKey: item.signalKey,
        label: item.label,
        value: item.value,
        excerpt: item.excerpt,
        sourceUrl: item.sourceUrl,
        confidence: Math.round(item.confidence * 100),
        createdAt: capturedAt,
      }))
    )
  }
}

export async function analyzeProjectResearch(
  projectId: string,
  options?: {
    screenshotUrl?: string | null
    screenshotFileKey?: string | null
  }
) {
  await ensureDefaultTaxonomyTerms()
  await ensureDefaultMarketMaps()

  const currentProject = await getProjectAnalysisContext(projectId)

  if (!currentProject) {
    return null
  }
  
  const githubSignal = await getGithubSignal(currentProject.repositoryUrl)
  const analysis = await runDeepResearchAnalysis({
    project: currentProject,
    screenshotUrl: options?.screenshotUrl ?? currentProject.screenshotUrl,
    githubSignal,
    openAiApiKey: env.OPENAI_API_KEY,
    openAiModel: env.OPENAI_MODEL,
  })
  const credibility = calculateCredibility({
    project: currentProject,
    analysis,
    githubSignal,
  })

  const latestSnapshot = await db
    .select()
    .from(projectSnapshots)
    .where(eq(projectSnapshots.projectId, currentProject.id))
    .orderBy(desc(projectSnapshots.capturedAt))
    .limit(1)

  const previousSnapshot = latestSnapshot[0] ?? null
  const snapshotId = crypto.randomUUID()
  const now = new Date()

  await db
    .insert(projectSignals)
    .values({
      projectId: currentProject.id,
      likelyIcp: analysis.likelyIcp,
      analysisMethod: analysis.analysisMethod,
      pagesVisited: analysis.pagesVisited,
      coverageScore: analysis.coverageScore,
      marketClarityScore: analysis.marketClarityScore,
      conversionScore: analysis.conversionScore,
      trustScore: analysis.trustScore,
      technicalDepthScore: analysis.technicalDepthScore,
      proofScore: analysis.proofScore,
      freshnessScore: analysis.freshnessScore,
      pricingPageDetected: analysis.pricingPageDetected,
      docsDetected: analysis.docsDetected,
      demoCtaDetected: analysis.demoCtaDetected,
      authWallDetected: analysis.authWallDetected,
      enterpriseCueDetected: analysis.enterpriseCueDetected,
      selfServeCueDetected: analysis.selfServeCueDetected,
      proofPoints: analysis.proofPoints,
      evidenceSnippets: analysis.evidenceSnippets,
      primaryHeadline: analysis.primaryHeadline,
      researchSummary: analysis.researchSummary,
      comparisonNote: analysis.comparisonNote,
      executiveAbstract: analysis.executiveAbstract,
      forensicSummary: analysis.forensicSummary,
      methodologyNote: analysis.methodologyNote,
      confidenceScore: analysis.confidenceScore,
      htmlHash: analysis.htmlHash,
      screenshotHash: analysis.screenshotHash,
      analyzedAt: now,
    })
    .onConflictDoUpdate({
      target: projectSignals.projectId,
      set: {
        likelyIcp: analysis.likelyIcp,
        analysisMethod: analysis.analysisMethod,
        pagesVisited: analysis.pagesVisited,
        coverageScore: analysis.coverageScore,
        marketClarityScore: analysis.marketClarityScore,
        conversionScore: analysis.conversionScore,
        trustScore: analysis.trustScore,
        technicalDepthScore: analysis.technicalDepthScore,
        proofScore: analysis.proofScore,
        freshnessScore: analysis.freshnessScore,
        pricingPageDetected: analysis.pricingPageDetected,
        docsDetected: analysis.docsDetected,
        demoCtaDetected: analysis.demoCtaDetected,
        authWallDetected: analysis.authWallDetected,
        enterpriseCueDetected: analysis.enterpriseCueDetected,
        selfServeCueDetected: analysis.selfServeCueDetected,
        proofPoints: analysis.proofPoints,
        evidenceSnippets: analysis.evidenceSnippets,
        primaryHeadline: analysis.primaryHeadline,
        researchSummary: analysis.researchSummary,
        comparisonNote: analysis.comparisonNote,
        executiveAbstract: analysis.executiveAbstract,
        forensicSummary: analysis.forensicSummary,
        methodologyNote: analysis.methodologyNote,
        confidenceScore: analysis.confidenceScore,
        htmlHash: analysis.htmlHash,
        screenshotHash: analysis.screenshotHash,
        analyzedAt: now,
      },
    })

  await db.insert(projectSnapshots).values({
    id: snapshotId,
    projectId: currentProject.id,
    analysisRunId: null,
    screenshotUrl: options?.screenshotUrl ?? currentProject.screenshotUrl,
    screenshotFileKey: options?.screenshotFileKey ?? currentProject.screenshotFileKey,
    htmlHash: analysis.htmlHash,
    pageTitle: analysis.pageTitle,
    primaryHeadline: analysis.primaryHeadline,
    summary: analysis.snapshotSummary,
    executiveAbstract: analysis.executiveAbstract,
    forensicSummary: analysis.forensicSummary,
    pagesVisited: analysis.pagesVisited,
    evidenceCount: analysis.evidence.length,
    coverageScore: analysis.coverageScore,
    pricingPageDetected: analysis.pricingPageDetected,
    docsDetected: analysis.docsDetected,
    demoCtaDetected: analysis.demoCtaDetected,
    authWallDetected: analysis.authWallDetected,
    capturedAt: now,
  })

  await persistProjectSnapshotArtifacts(snapshotId, analysis, now)

  const normalizedPrimaryUseCase =
    currentProject.primaryUseCase ?? analysis.inferredPrimaryUseCase
  const normalizedBuyerType = currentProject.buyerType ?? analysis.inferredBuyerType
  const normalizedInteractionModel =
    currentProject.interactionModel ?? analysis.inferredInteractionModel
  const normalizedPricingVisibility =
    currentProject.pricingVisibility ?? analysis.inferredPricingVisibility
  const normalizedDeploymentSurface =
    currentProject.deploymentSurface ?? analysis.inferredDeploymentSurface
  const normalizedModelVendorMix =
    currentProject.modelVendorMix ?? analysis.inferredModelVendorMix

  await db
    .update(projects)
    .set({
      primaryUseCase: normalizedPrimaryUseCase,
      buyerType: normalizedBuyerType,
      interactionModel: normalizedInteractionModel,
      pricingVisibility: normalizedPricingVisibility,
      deploymentSurface: normalizedDeploymentSurface,
      modelVendorMix: normalizedModelVendorMix,
      credibilityScore: credibility.score,
      credibilitySummary: credibility.summary,
      lastAnalyzedAt: now,
      nextPulseDueAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      updatedAt: now,
    })
    .where(eq(projects.id, currentProject.id))

  await persistFeatureGaps(
    currentProject.id,
    buildFeatureGapRecommendations({
      project: currentProject,
      analysis,
      credibilitySummary: credibility.summary ?? "",
    })
  )

  await syncTaxonomyTerms(currentProject.id, [
    normalizedPrimaryUseCase,
    normalizedBuyerType,
    normalizedInteractionModel,
    ...analysis.taxonomyLabels,
  ])
  await detectSnapshotChanges(currentProject.id, previousSnapshot, {
    id: snapshotId,
    primaryHeadline: analysis.primaryHeadline,
    summary: analysis.snapshotSummary,
    pricingPageDetected: analysis.pricingPageDetected,
    docsDetected: analysis.docsDetected,
    demoCtaDetected: analysis.demoCtaDetected,
    authWallDetected: analysis.authWallDetected,
  })
  await detectEvidenceDrivenChanges(currentProject.id, previousSnapshot?.id ?? null, snapshotId, analysis)
  await rebuildPeerSet(currentProject.id)
  await syncRadarTargetFromProject(currentProject.id)

  return {
    snapshotId,
    analysis,
  }
}

export async function refreshProjectPulse(projectId: string) {
  const project = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      appUrl: projects.appUrl,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  const currentProject = project[0]

  if (!currentProject) {
    return
  }

  const screenshot = await captureAndUploadScreenshot({
    appUrl: currentProject.appUrl,
    slug: `${currentProject.slug}-${Date.now()}`,
  })

  await db
    .update(projects)
    .set({
      screenshotUrl: screenshot.screenshotUrl,
      screenshotFileKey: screenshot.screenshotFileKey,
      screenshotCapturedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, currentProject.id))

  const queuedRun = await queueProjectResearchAnalysis(currentProject.id, "scheduled")
  await processProjectAnalysisRun(queuedRun.id, screenshot).catch(() => null)
}

export async function syncDueProjectResearch(limit = 12) {
  const queuedProcessed = await processQueuedProjectResearch(limit)
  const dueProjects = await db
    .select({
      id: projects.id,
    })
    .from(projects)
    .where(
      and(
        eq(projects.status, PROJECT_STATUS.published),
        isNotNull(projects.screenshotUrl),
        or(lte(projects.nextPulseDueAt, new Date()), isNull(projects.nextPulseDueAt))
      )
    )
    .orderBy(asc(projects.nextPulseDueAt), asc(projects.publishedAt))
    .limit(limit)

  for (const project of dueProjects) {
    await refreshProjectPulse(project.id).catch(() => null)
  }

  return queuedProcessed + dueProjects.length
}

export async function getResearchProjects(filters: ResearchFilters = {}) {
  const conditions = [
    eq(projects.status, PROJECT_STATUS.published),
    isNotNull(projects.screenshotUrl),
  ]

  if (filters.query) {
    conditions.push(
      or(
        ilike(projects.name, `%${filters.query}%`),
        ilike(projects.shortDescription, `%${filters.query}%`),
        ilike(projectSignals.researchSummary, `%${filters.query}%`)
      )!
    )
  }

  if (filters.primaryUseCase) {
    conditions.push(eq(projects.primaryUseCase, filters.primaryUseCase))
  }

  if (filters.buyerType) {
    conditions.push(eq(projects.buyerType, filters.buyerType))
  }

  if (filters.pricingVisibility) {
    conditions.push(eq(projects.pricingVisibility, filters.pricingVisibility))
  }

  if (filters.deploymentSurface) {
    conditions.push(eq(projects.deploymentSurface, filters.deploymentSurface))
  }

  if (filters.verifiedOnly) {
    conditions.push(eq(projects.verified, true))
  }

  const result = await db
    .select(projectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(projects.credibilityScore), desc(projects.publishedAt), desc(projects.createdAt))

  const peerIds = result.map((project) => project.id)
  const peers = peerIds.length
    ? await db
        .select({
          projectId: projectPeerSets.projectId,
          peerProjectId: projectPeerSets.peerProjectId,
          similarityScore: projectPeerSets.similarityScore,
          peerSlug: projects.slug,
          peerName: projects.name,
        })
        .from(projectPeerSets)
        .innerJoin(projects, eq(projects.id, projectPeerSets.peerProjectId))
        .where(inArray(projectPeerSets.projectId, peerIds))
        .orderBy(desc(projectPeerSets.similarityScore))
    : []

  return result.map((project) => {
    const topPeer = peers.find((entry) => entry.projectId === project.id)

    return {
      ...normalizeResearchProject(project),
      topPeer: topPeer
        ? {
            id: topPeer.peerProjectId,
            slug: topPeer.peerSlug,
            name: topPeer.peerName,
            similarityScore: topPeer.similarityScore,
          }
        : null,
    }
  })
}

export async function getResearchProjectBySlug(slug: string) {
  const result = await db
    .select(projectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(
      and(
        eq(projects.slug, slug),
        eq(projects.status, PROJECT_STATUS.published),
        isNotNull(projects.screenshotUrl)
      )
    )
    .limit(1)

  const project = result[0]

  return project ? normalizeResearchProject(project) : null
}

export async function getResearchProjectsByIds(ids: string[]) {
  if (ids.length === 0) {
    return []
  }

  const result = await db
    .select(projectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(
      and(
        inArray(projects.id, ids),
        eq(projects.status, PROJECT_STATUS.published),
        isNotNull(projects.screenshotUrl)
      )
    )

  return result.map(normalizeResearchProject)
}

export async function getProjectPeers(projectId: string, limit = 6) {
  const result = await db
    .select({
      similarityScore: projectPeerSets.similarityScore,
      rationale: projectPeerSets.rationale,
      ...projectSelection,
    })
    .from(projectPeerSets)
    .innerJoin(projects, eq(projects.id, projectPeerSets.peerProjectId))
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(eq(projectPeerSets.projectId, projectId))
    .orderBy(desc(projectPeerSets.similarityScore))
    .limit(limit)

  return result.map((project) => ({
    ...normalizeResearchProject(project),
    similarityScore: project.similarityScore,
    rationale: project.rationale,
  }))
}

export async function getProjectTimeline(projectId: string, limit = 24) {
  return db
    .select({
      id: projectChanges.id,
      changeType: projectChanges.changeType,
      title: projectChanges.title,
      detail: projectChanges.detail,
      impact: projectChanges.impact,
      detectedAt: projectChanges.detectedAt,
    })
    .from(projectChanges)
    .where(eq(projectChanges.projectId, projectId))
    .orderBy(desc(projectChanges.detectedAt))
    .limit(limit)
}

export async function getProjectStrategyTimeline(projectId: string, limit = 24) {
  const target = await db
    .select({
      id: radarTargets.id,
    })
    .from(radarTargets)
    .where(eq(radarTargets.projectId, projectId))
    .limit(1)

  if (!target[0]) {
    return []
  }

  return db
    .select({
      id: narrativeEvents.id,
      eventKey: narrativeEvents.eventKey,
      title: narrativeEvents.title,
      detail: narrativeEvents.detail,
      impact: narrativeEvents.impact,
      detectedAt: narrativeEvents.detectedAt,
    })
    .from(narrativeEvents)
    .where(eq(narrativeEvents.radarTargetId, target[0].id))
    .orderBy(desc(narrativeEvents.detectedAt))
    .limit(limit)
}

export async function getProjectForensics(projectId: string) {
  const [latestSnapshot, latestRun] = await Promise.all([
    db
      .select({
        id: projectSnapshots.id,
        analysisRunId: projectSnapshots.analysisRunId,
        capturedAt: projectSnapshots.capturedAt,
        executiveAbstract: projectSnapshots.executiveAbstract,
        forensicSummary: projectSnapshots.forensicSummary,
        summary: projectSnapshots.summary,
        pagesVisited: projectSnapshots.pagesVisited,
        evidenceCount: projectSnapshots.evidenceCount,
        coverageScore: projectSnapshots.coverageScore,
      })
      .from(projectSnapshots)
      .where(eq(projectSnapshots.projectId, projectId))
      .orderBy(desc(projectSnapshots.capturedAt))
      .limit(1),
    getLatestProjectAnalysisRun(projectId),
  ])

  const snapshot = latestSnapshot[0] ?? null

  if (!snapshot) {
    return {
      snapshot: null,
      pages: [],
      evidence: [],
      latestRun,
    }
  }

  const [pages, evidence] = await Promise.all([
    db
      .select({
        id: projectSnapshotPages.id,
        url: projectSnapshotPages.url,
        pageType: projectSnapshotPages.pageType,
        statusCode: projectSnapshotPages.statusCode,
        finalUrl: projectSnapshotPages.finalUrl,
        title: projectSnapshotPages.title,
        canonicalUrl: projectSnapshotPages.canonicalUrl,
        metaDescription: projectSnapshotPages.metaDescription,
        htmlHash: projectSnapshotPages.htmlHash,
        textHash: projectSnapshotPages.textHash,
        capturedAt: projectSnapshotPages.capturedAt,
      })
      .from(projectSnapshotPages)
      .where(eq(projectSnapshotPages.snapshotId, snapshot.id))
      .orderBy(asc(projectSnapshotPages.pageType), asc(projectSnapshotPages.finalUrl)),
    db
      .select({
        id: projectEvidenceItems.id,
        snapshotPageId: projectEvidenceItems.snapshotPageId,
        category: projectEvidenceItems.category,
        signalKey: projectEvidenceItems.signalKey,
        label: projectEvidenceItems.label,
        value: projectEvidenceItems.value,
        excerpt: projectEvidenceItems.excerpt,
        sourceUrl: projectEvidenceItems.sourceUrl,
        confidence: projectEvidenceItems.confidence,
      })
      .from(projectEvidenceItems)
      .where(eq(projectEvidenceItems.snapshotId, snapshot.id))
      .orderBy(desc(projectEvidenceItems.confidence), asc(projectEvidenceItems.category), asc(projectEvidenceItems.label)),
  ])

  return {
    snapshot,
    pages,
    evidence,
    latestRun,
  }
}

export async function getPulseFeed(limit = 40, eventKey?: string) {
  const strategicConditions = [eventKey ? eq(narrativeEvents.eventKey, eventKey) : undefined].filter(
    Boolean
  )
  const strategicFeed = await db
    .select({
      id: narrativeEvents.id,
      changeType: narrativeEvents.eventKey,
      title: narrativeEvents.title,
      detail: narrativeEvents.detail,
      impact: narrativeEvents.impact,
      detectedAt: narrativeEvents.detectedAt,
      projectId: projects.id,
      projectSlug: projects.slug,
      projectName: projects.name,
      radarSlug: radarTargets.slug,
      radarName: radarTargets.name,
      screenshotUrl: radarTargets.screenshotUrl,
      credibilityScore: radarTargets.credibilityScore,
    })
    .from(narrativeEvents)
    .innerJoin(radarTargets, eq(radarTargets.id, narrativeEvents.radarTargetId))
    .leftJoin(projects, eq(projects.id, radarTargets.projectId))
    .where(strategicConditions.length > 0 ? and(...strategicConditions) : undefined)
    .orderBy(desc(narrativeEvents.detectedAt))
    .limit(limit)

  if (strategicFeed.length > 0) {
    return strategicFeed.map((item) => ({
      ...item,
      projectSlug: item.projectSlug ?? item.radarSlug,
      projectName: item.projectName ?? item.radarName,
    }))
  }

  const fallbackConditions = [eventKey ? eq(projectChanges.changeType, eventKey) : undefined].filter(
    Boolean
  )

  return db
    .select({
      id: projectChanges.id,
      changeType: projectChanges.changeType,
      title: projectChanges.title,
      detail: projectChanges.detail,
      impact: projectChanges.impact,
      detectedAt: projectChanges.detectedAt,
      projectId: projects.id,
      projectSlug: projects.slug,
      projectName: projects.name,
      screenshotUrl: projects.screenshotUrl,
      credibilityScore: projects.credibilityScore,
    })
    .from(projectChanges)
    .innerJoin(projects, eq(projects.id, projectChanges.projectId))
    .where(fallbackConditions.length > 0 ? and(...fallbackConditions) : undefined)
    .orderBy(desc(projectChanges.detectedAt))
    .limit(limit)
}

export async function getCollectionsForUser(userId: string) {
  const collections = await db
    .select({
      id: researchCollections.id,
      name: researchCollections.name,
      description: researchCollections.description,
      shareToken: researchCollections.shareToken,
      isPublic: researchCollections.isPublic,
      briefMarkdown: researchCollections.briefMarkdown,
      briefGeneratedAt: researchCollections.briefGeneratedAt,
      createdAt: researchCollections.createdAt,
      updatedAt: researchCollections.updatedAt,
    })
    .from(researchCollections)
    .where(eq(researchCollections.createdByUserId, userId))
    .orderBy(desc(researchCollections.updatedAt))

  const counts = collections.length
    ? await db
        .select({
          collectionId: collectionItems.collectionId,
        })
        .from(collectionItems)
        .where(inArray(collectionItems.collectionId, collections.map((collection) => collection.id)))
    : []

  return collections.map((collection) => ({
    ...collection,
    itemCount: counts.filter((item) => item.collectionId === collection.id).length,
  }))
}

export async function getCollectionsForProject(userId: string, projectId: string) {
  const collections = await getCollectionsForUser(userId)

  if (collections.length === 0) {
    return []
  }

  const memberships = await db
    .select({
      collectionId: collectionItems.collectionId,
    })
    .from(collectionItems)
    .innerJoin(researchCollections, eq(researchCollections.id, collectionItems.collectionId))
    .where(
      and(
        eq(collectionItems.projectId, projectId),
        eq(researchCollections.createdByUserId, userId)
      )
    )

  const membershipIds = new Set(memberships.map((entry) => entry.collectionId))

  return collections.map((collection) => ({
    ...collection,
    containsProject: membershipIds.has(collection.id),
  }))
}

export async function getProjectCollectionSummary(
  userId: string,
  projectIds: string[]
): Promise<Record<string, ProjectCollectionSummary>> {
  if (projectIds.length === 0) {
    return {}
  }

  const memberships = await db
    .select({
      projectId: collectionItems.projectId,
      collectionId: researchCollections.id,
      collectionName: researchCollections.name,
    })
    .from(collectionItems)
    .innerJoin(researchCollections, eq(researchCollections.id, collectionItems.collectionId))
    .where(
      and(
        inArray(collectionItems.projectId, projectIds),
        eq(researchCollections.createdByUserId, userId)
      )
    )

  return projectIds.reduce<Record<string, ProjectCollectionSummary>>((accumulator, projectId) => {
    const linkedCollections = memberships
      .filter((entry) => entry.projectId === projectId)
      .map((entry) => ({
        id: entry.collectionId,
        name: entry.collectionName,
        containsProject: true,
      }))

    accumulator[projectId] = {
      collectionCount: linkedCollections.length,
      linkedCollections,
    }

    return accumulator
  }, {})
}

export async function getProjectFeatureGapSummary(
  projectIds: string[]
): Promise<Record<string, ProjectFeatureGapSummary>> {
  if (projectIds.length === 0) {
    return {}
  }

  const gaps = await db
    .select({
      projectId: projectFeatureGaps.projectId,
      title: projectFeatureGaps.title,
      impact: projectFeatureGaps.impact,
      confidence: projectFeatureGaps.confidence,
    })
    .from(projectFeatureGaps)
    .where(inArray(projectFeatureGaps.projectId, projectIds))
    .orderBy(desc(projectFeatureGaps.confidence), asc(projectFeatureGaps.title))

  return projectIds.reduce<Record<string, ProjectFeatureGapSummary>>((accumulator, projectId) => {
    const projectGaps = gaps.filter((gap) => gap.projectId === projectId)
    const topFeatureGap = projectGaps[0]

    accumulator[projectId] = {
      featureGapCount: projectGaps.length,
      topFeatureGap: topFeatureGap
        ? {
            title: topFeatureGap.title,
            impact: topFeatureGap.impact,
            confidence: topFeatureGap.confidence,
          }
        : null,
    }

    return accumulator
  }, {})
}

export async function createResearchCollection({
  userId,
  name,
  description,
}: {
  userId: string
  name: string
  description?: string
}) {
  const collectionId = crypto.randomUUID()

  await db.insert(researchCollections).values({
    id: collectionId,
    name: name.trim().slice(0, 80),
    description: description?.trim().slice(0, 240) || null,
    shareToken: randomBytes(18).toString("hex"),
    createdByUserId: userId,
  })

  return collectionId
}

export async function getCollectionDetail(collectionId: string, userId: string) {
  const collection = await db
    .select()
    .from(researchCollections)
    .where(
      and(
        eq(researchCollections.id, collectionId),
        eq(researchCollections.createdByUserId, userId)
      )
    )
    .limit(1)

  const currentCollection = collection[0]

  if (!currentCollection) {
    return null
  }

  const items = await db
    .select({
      note: collectionItems.note,
      addedAt: collectionItems.addedAt,
      ...projectSelection,
    })
    .from(collectionItems)
    .innerJoin(projects, eq(projects.id, collectionItems.projectId))
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(eq(collectionItems.collectionId, collectionId))
    .orderBy(desc(collectionItems.addedAt))

  return {
    ...currentCollection,
    items: await enrichCollectionItems(items),
  }
}

export async function getSharedCollection(shareToken: string) {
  const collection = await db
    .select()
    .from(researchCollections)
    .where(
      and(eq(researchCollections.shareToken, shareToken), eq(researchCollections.isPublic, true))
    )
    .limit(1)

  const currentCollection = collection[0]

  if (!currentCollection) {
    return null
  }

  const items = await db
    .select({
      note: collectionItems.note,
      addedAt: collectionItems.addedAt,
      ...projectSelection,
    })
    .from(collectionItems)
    .innerJoin(projects, eq(projects.id, collectionItems.projectId))
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(eq(collectionItems.collectionId, currentCollection.id))
    .orderBy(desc(collectionItems.addedAt))

  return {
    ...currentCollection,
    items: await enrichCollectionItems(items),
  }
}

export async function addProjectToCollection({
  collectionId,
  userId,
  projectId,
  note,
}: {
  collectionId: string
  userId: string
  projectId: string
  note?: string
}): Promise<
  | { ok: true; added: boolean }
  | { ok: false; error: "collection-not-found" | "forbidden" | "project-not-found" }
> {
  const collection = await db
    .select({
      id: researchCollections.id,
      createdByUserId: researchCollections.createdByUserId,
    })
    .from(researchCollections)
    .where(eq(researchCollections.id, collectionId))
    .limit(1)

  if (!collection[0]) {
    return {
      ok: false,
      error: "collection-not-found",
    }
  }

  if (collection[0].createdByUserId !== userId) {
    return {
      ok: false,
      error: "forbidden",
    }
  }

  const project = await db
    .select({
      id: projects.id,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project[0]) {
    return {
      ok: false,
      error: "project-not-found",
    }
  }

  await db
    .insert(collectionItems)
    .values({
      collectionId,
      projectId,
      note: note?.trim().slice(0, 300) || null,
    })
    .onConflictDoUpdate({
      target: [collectionItems.collectionId, collectionItems.projectId],
      set: {
        note: note?.trim().slice(0, 300) || null,
      },
    })

  await db
    .update(researchCollections)
    .set({ updatedAt: new Date() })
    .where(eq(researchCollections.id, collectionId))

  return {
    ok: true,
    added: true,
  }
}

export async function removeProjectFromCollection({
  collectionId,
  userId,
  projectId,
}: {
  collectionId: string
  userId: string
  projectId: string
}): Promise<
  | { ok: true; removed: boolean }
  | { ok: false; error: "collection-not-found" | "forbidden" }
> {
  const collection = await db
    .select({
      id: researchCollections.id,
      createdByUserId: researchCollections.createdByUserId,
    })
    .from(researchCollections)
    .where(eq(researchCollections.id, collectionId))
    .limit(1)

  if (!collection[0]) {
    return {
      ok: false,
      error: "collection-not-found",
    }
  }

  if (collection[0].createdByUserId !== userId) {
    return {
      ok: false,
      error: "forbidden",
    }
  }

  await db
    .delete(collectionItems)
    .where(
      and(
        eq(collectionItems.collectionId, collectionId),
        eq(collectionItems.projectId, projectId)
      )
    )

  await db
    .update(researchCollections)
    .set({ updatedAt: new Date() })
    .where(eq(researchCollections.id, collectionId))

  return {
    ok: true,
    removed: true,
  }
}

export async function updateCollectionSharing({
  collectionId,
  userId,
  isPublic,
}: {
  collectionId: string
  userId: string
  isPublic: boolean
}) {
  await db
    .update(researchCollections)
    .set({
      isPublic,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(researchCollections.id, collectionId),
        eq(researchCollections.createdByUserId, userId)
      )
    )
}

export async function generateCollectionBrief(collectionId: string, userId: string) {
  const collection = await getCollectionDetail(collectionId, userId)

  if (!collection) {
    return null
  }

  const markdown = buildCollectionBrief(collection)

  await db
    .update(researchCollections)
    .set({
      briefMarkdown: markdown,
      briefGeneratedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(researchCollections.id, collectionId))

  return markdown
}

export async function getProjectFeatureGaps(projectId: string) {
  return db
    .select({
      featureKey: projectFeatureGaps.featureKey,
      title: projectFeatureGaps.title,
      reason: projectFeatureGaps.reason,
      impact: projectFeatureGaps.impact,
      confidence: projectFeatureGaps.confidence,
      evidence: projectFeatureGaps.evidence,
      implementationHint: projectFeatureGaps.implementationHint,
      status: projectFeatureGaps.status,
      updatedAt: projectFeatureGaps.updatedAt,
    })
    .from(projectFeatureGaps)
    .where(eq(projectFeatureGaps.projectId, projectId))
    .orderBy(desc(projectFeatureGaps.confidence), asc(projectFeatureGaps.title))
}

async function enrichCollectionItems<
  T extends ProjectWithSignalsRow & {
    note: string | null
    addedAt: Date
  },
>(items: T[]) {
  const projectIds = items.map((item) => item.id)
  const gaps = projectIds.length
    ? await db
        .select({
          projectId: projectFeatureGaps.projectId,
          title: projectFeatureGaps.title,
          impact: projectFeatureGaps.impact,
          confidence: projectFeatureGaps.confidence,
        })
        .from(projectFeatureGaps)
        .where(inArray(projectFeatureGaps.projectId, projectIds))
        .orderBy(desc(projectFeatureGaps.confidence), asc(projectFeatureGaps.title))
    : []

  return items.map((item) => {
    const normalized = normalizeResearchProject(item)
    const itemGaps = gaps.filter((gap) => gap.projectId === item.id)
    const highConfidenceGap =
      itemGaps.find((gap) => gap.confidence >= 65 && gap.impact !== "low") ?? itemGaps[0] ?? null

    return {
      ...normalized,
      note: item.note,
      addedAt: item.addedAt,
      featureGapCount: itemGaps.length,
      featureGapSummary: highConfidenceGap
        ? {
            title: highConfidenceGap.title,
            impact: highConfidenceGap.impact,
            confidence: highConfidenceGap.confidence,
          }
        : null,
      analysisPending:
        !normalized.lastAnalyzedAt ||
        (normalized.confidenceScore < 45 && normalized.status !== PROJECT_STATUS.published),
    }
  })
}

export async function sendWeeklyResearchDigest() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  const changes = await db
    .select({
      title: projectChanges.title,
      detail: projectChanges.detail,
      detectedAt: projectChanges.detectedAt,
      projectSlug: projects.slug,
      projectName: projects.name,
    })
    .from(projectChanges)
    .innerJoin(projects, eq(projects.id, projectChanges.projectId))
    .where(and(eq(projects.status, PROJECT_STATUS.published), gte(projectChanges.detectedAt, since)))
    .orderBy(desc(projectChanges.detectedAt))
    .limit(20)

  if (changes.length === 0) {
    return 0
  }

  const subscribers = await db
    .select({
      email: user.email,
      name: user.name,
    })
    .from(userProfiles)
    .innerJoin(user, eq(user.id, userProfiles.userId))
    .where(eq(userProfiles.weeklyDigest, true))

  for (const subscriber of subscribers) {
    await sendWeeklyDigestEmail({
      email: subscriber.email,
      name: subscriber.name,
      changes: changes.map((change) => ({
        title: change.title,
        detail: change.detail,
        projectName: change.projectName,
        href: `${env.BETTER_AUTH_URL}/projects/${change.projectSlug}`,
        detectedAt: change.detectedAt.toISOString(),
      })),
    }).catch(() => null)
  }

  return subscribers.length
}

function normalizeResearchProject(project: ProjectWithSignalsRow) {
  return {
    ...project,
    analysisMethod: project.analysisMethod ?? "deterministic",
    pagesVisited: project.pagesVisited ?? 0,
    coverageScore: project.coverageScore ?? 0,
    marketClarityScore: project.marketClarityScore ?? 0,
    conversionScore: project.conversionScore ?? 0,
    trustScore: project.trustScore ?? 0,
    technicalDepthScore: project.technicalDepthScore ?? 0,
    proofScore: project.proofScore ?? 0,
    freshnessScore: project.freshnessScore ?? 0,
    proofPoints: project.proofPoints ?? [],
    evidenceSnippets: project.evidenceSnippets ?? [],
    executiveAbstract: project.executiveAbstract ?? null,
    forensicSummary: project.forensicSummary ?? null,
    methodologyNote: project.methodologyNote ?? null,
    pricingPageDetected: Boolean(project.pricingPageDetected),
    docsDetected: Boolean(project.docsDetected),
    demoCtaDetected: Boolean(project.demoCtaDetected),
    authWallDetected: Boolean(project.authWallDetected),
    enterpriseCueDetected: Boolean(project.enterpriseCueDetected),
    selfServeCueDetected: Boolean(project.selfServeCueDetected),
    confidenceScore: project.confidenceScore ?? 0,
  }
}

async function fetchProjectHtml(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12_000),
  })

  const html = await response.text()

  return {
    html,
    finalUrl: response.url,
  }
}

function analyzeHtml({
  project,
  html,
  finalUrl,
  screenshotUrl,
}: {
  project: {
    name: string
    shortDescription: string
    appUrl: string
    aiTools: string[]
    tags: string[]
    primaryUseCase: string | null
    buyerType: string | null
    interactionModel: string | null
    pricingVisibility: string | null
    deploymentSurface: string | null
    modelVendorMix: string | null
  }
  html: string
  finalUrl: string
  screenshotUrl: string | null
}): ResearchAnalysis {
  const text = stripHtml(html)
  const lower = text.toLowerCase()
  const title = extractTitle(html)
  const description =
    extractMetaContent(html, "description") ??
    extractMetaContent(html, "og:description") ??
    project.shortDescription
  const headings = extractHeadings(html)
  const primaryHeadline = headings[0] ?? title ?? project.name
  const links = extractLinks(html)
  const linkText = links.map((link) => `${link.label} ${link.href}`.toLowerCase()).join(" ")

  const pricingPageDetected =
    containsAny(lower, ["pricing", "plans", "start for free", "free trial"]) ||
    containsAny(linkText, ["pricing", "/pricing", "plans"])
  const docsDetected =
    containsAny(lower, ["docs", "documentation", "developer api"]) ||
    containsAny(linkText, ["docs", "documentation", "/api", "/docs"])
  const demoCtaDetected =
    containsAny(lower, ["book a demo", "request a demo", "watch demo"]) ||
    containsAny(linkText, ["demo", "book a demo", "request a demo"])
  const authWallDetected =
    containsAny(lower, ["sign in", "log in", "join waitlist"]) &&
    !pricingPageDetected &&
    !docsDetected
  const enterpriseCueDetected = containsAny(lower, [
    "enterprise",
    "security",
    "compliance",
    "soc 2",
    "book a demo",
    "contact sales",
  ])
  const selfServeCueDetected = containsAny(lower, [
    "start for free",
    "free trial",
    "get started",
    "self-serve",
  ])
  const integrationCueDetected =
    containsAny(lower, ["integrations", "connect", "slack", "zapier", "notion", "github"]) ||
    containsAny(linkText, ["integration", "integrations", "slack", "zapier", "notion", "github"])
  const collaborationCueDetected = containsAny(lower, [
    "team workspace",
    "collaborate",
    "shared inbox",
    "multi-user",
    "comment",
    "team members",
  ])
  const analyticsCueDetected = containsAny(lower, [
    "analytics",
    "insights",
    "reporting",
    "dashboard",
    "metrics",
  ])
  const apiSurfaceDetected =
    docsDetected ||
    containsAny(lower, ["api", "sdk", "webhook", "developer"]) ||
    containsAny(linkText, ["/api", "developer", "webhook", "sdk"])
  const compareSurfaceDetected =
    containsAny(lower, ["compare", "versus", "benchmark", "vs."]) ||
    containsAny(linkText, ["compare", "benchmark", "/compare"])

  const proofPoints = normalizeSet([
    containsAny(lower, ["testimonial", "customer story", "case study"]) ? "Customer proof" : null,
    containsAny(lower, ["trusted by", "used by", "logos"]) ? "Logo wall" : null,
    containsAny(lower, ["security", "soc 2", "gdpr"]) ? "Security posture" : null,
  ])

  const likelyIcp = inferIcp(lower, project.tags)
  const inferredPrimaryUseCase = inferPrimaryUseCase(lower, project.tags)
  const inferredBuyerType = project.buyerType ?? likelyIcp
  const inferredInteractionModel = inferInteractionModel(lower, project.tags)
  const inferredPricingVisibility = pricingPageDetected
    ? "Visible pricing"
    : demoCtaDetected || enterpriseCueDetected
      ? "Contact sales"
      : "Unknown"
  const inferredDeploymentSurface = inferDeploymentSurface(lower, finalUrl)
  const inferredModelVendorMix = inferModelVendorMix(project.aiTools)

  const evidenceSnippets = normalizeSet([
    primaryHeadline,
    description,
    headings.find((heading) => containsAny(heading.toLowerCase(), ["pricing", "security", "docs"])),
    links.find((link) => containsAny(link.label.toLowerCase(), ["pricing", "docs", "demo"]))?.label,
  ]).slice(0, 4)

  const researchSummary = [
    inferredPrimaryUseCase
      ? `${project.name} reads like a ${inferredPrimaryUseCase.toLowerCase()} product`
      : `${project.name} presents as a live AI product`,
    inferredBuyerType ? `for ${inferredBuyerType.toLowerCase()}` : "for a mixed audience",
    pricingPageDetected
      ? "with visible pricing"
      : demoCtaDetected
        ? "with a demo-led conversion path"
        : "without explicit pricing",
    docsDetected ? "and public docs." : "and limited public documentation.",
  ].join(" ")

  return {
    analysisMethod: "legacy-single-page",
    pagesAttempted: 1,
    pagesVisited: 1,
    coverageScore: 22,
    marketClarityScore: 54,
    conversionScore: pricingPageDetected ? 68 : demoCtaDetected ? 56 : 42,
    trustScore: proofPoints.length > 0 ? 58 : 40,
    technicalDepthScore: docsDetected ? 64 : 38,
    proofScore: proofPoints.length > 0 ? 60 : 36,
    freshnessScore: 34,
    likelyIcp,
    pricingPageDetected,
    docsDetected,
    demoCtaDetected,
    authWallDetected,
    enterpriseCueDetected,
    selfServeCueDetected,
    integrationCueDetected,
    collaborationCueDetected,
    analyticsCueDetected,
    apiSurfaceDetected,
    compareSurfaceDetected,
    proofPoints,
    evidenceSnippets,
    primaryHeadline,
    researchSummary,
    comparisonNote: buildComparisonNote({
      pricingPageDetected,
      docsDetected,
      demoCtaDetected,
      enterpriseCueDetected,
      selfServeCueDetected,
      proofPoints,
    }),
    confidenceScore: Math.min(
      100,
      42 +
        (headings.length > 0 ? 10 : 0) +
        (description ? 10 : 0) +
        (proofPoints.length > 0 ? 8 : 0) +
        (docsDetected ? 8 : 0) +
        (pricingPageDetected ? 8 : 0)
    ),
    htmlHash: hashValue(text),
    screenshotHash: screenshotUrl ? hashValue(screenshotUrl) : null,
    pageTitle: title,
    snapshotSummary: `${primaryHeadline ?? project.name}. ${description}`.slice(0, 280),
    taxonomyLabels: normalizeSet([
      inferredPrimaryUseCase,
      inferredBuyerType,
      inferredInteractionModel,
      pricingPageDetected ? "Pricing visible" : null,
      docsDetected ? "Docs visible" : null,
      demoCtaDetected ? "Demo CTA" : null,
      enterpriseCueDetected ? "Enterprise cues" : null,
      selfServeCueDetected ? "Self-serve" : null,
    ]),
    inferredPrimaryUseCase,
    inferredBuyerType,
    inferredInteractionModel,
    inferredPricingVisibility,
    inferredDeploymentSurface,
    inferredModelVendorMix,
    executiveAbstract: `${project.name} was analyzed from a single public page snapshot, producing a lighter-confidence forensic summary.`,
    forensicSummary: `The current legacy pass observed ${pricingPageDetected ? "pricing cues" : "no explicit pricing cues"}, ${docsDetected ? "public docs" : "limited technical proof"}, and ${proofPoints.length > 0 ? "some public proof markers" : "thin proof markers"}.`,
    methodologyNote: "Methodology: single-page legacy crawl using deterministic heuristics over the current landing page HTML.",
    pages: [
      {
        url: project.appUrl,
        pageType: "homepage",
        depth: 0,
        statusCode: 200,
        finalUrl,
        title,
        canonicalUrl: null,
        metaDescription: description,
        primaryHeadline,
        headings,
        ctaLabels: [],
        navLabels: [],
        structuredDataTypes: [],
        outboundDomains: [],
        hasForm: false,
        authWallDetected,
        htmlHash: hashValue(html),
        textHash: hashValue(text),
        textSnippet: `${primaryHeadline ?? project.name}. ${description}`.slice(0, 180),
      },
    ],
    evidence: evidenceSnippets.map((snippet, index) => ({
      category: index === 0 ? "market" : "coverage",
      signalKey: `legacy-snippet-${index + 1}`,
      label: "Legacy evidence",
      value: snippet,
      excerpt: snippet,
      sourceUrl: finalUrl,
      confidence: 0.64,
    })),
  }
}

async function syncTaxonomyTerms(projectId: string, labels: Array<string | null | undefined>) {
  const normalizedLabels = normalizeSet(labels)
  const slugs = normalizedLabels.map((label) => slugifyTerm(label))

  for (const [index, label] of normalizedLabels.entries()) {
    const slug = slugs[index]
    await db
      .insert(taxonomyTerms)
      .values({
        id: `taxonomy_${slug}`,
        slug,
        label,
        group: "market-signal",
      })
      .onConflictDoNothing()
  }

  await db.delete(projectTaxonomyTerms).where(eq(projectTaxonomyTerms.projectId, projectId))

  if (slugs.length === 0) {
    return
  }

  const persistedTerms = await db
    .select({
      id: taxonomyTerms.id,
      slug: taxonomyTerms.slug,
    })
    .from(taxonomyTerms)
    .where(inArray(taxonomyTerms.slug, slugs))

  const persistedTermIdBySlug = new Map(
    persistedTerms.map((term) => [term.slug, term.id])
  )
  const termIds = slugs
    .map((slug) => persistedTermIdBySlug.get(slug))
    .filter((value): value is string => Boolean(value))

  if (termIds.length !== slugs.length) {
    const missingSlugs = slugs.filter((slug) => !persistedTermIdBySlug.has(slug))
    throw new Error(`Missing taxonomy terms for slugs: ${missingSlugs.join(", ")}`)
  }

  await db.insert(projectTaxonomyTerms).values(
    termIds.map((taxonomyTermId) => ({
      projectId,
      taxonomyTermId,
      source: "observed",
      weight: 1,
    }))
  )
}

async function detectSnapshotChanges(
  projectId: string,
  previousSnapshot: {
    primaryHeadline: string | null
    summary: string | null
    pricingPageDetected: boolean
    docsDetected: boolean
    demoCtaDetected: boolean
    authWallDetected: boolean
  } | null,
  nextSnapshot: {
    id: string
    primaryHeadline: string | null
    summary: string
    pricingPageDetected: boolean
    docsDetected: boolean
    demoCtaDetected: boolean
    authWallDetected: boolean
  }
) {
  if (!previousSnapshot) {
    await db.insert(projectChanges).values({
      id: crypto.randomUUID(),
      projectId,
      snapshotId: nextSnapshot.id,
      changeType: "new-snapshot",
      title: "Initial research snapshot captured",
      detail: "The project now has a baseline snapshot for launch forensics and future change tracking.",
      impact: "medium",
    })
    return
  }

  const changesToInsert: Array<{
    changeType: string
    title: string
    detail: string
    impact: string
  }> = []

  if (previousSnapshot.primaryHeadline !== nextSnapshot.primaryHeadline) {
    changesToInsert.push({
      changeType: "headline-shift",
      title: "Headline changed",
      detail: `The primary headline changed from "${previousSnapshot.primaryHeadline ?? "unknown"}" to "${nextSnapshot.primaryHeadline ?? "unknown"}".`,
      impact: "high",
    })
  }

  if (!previousSnapshot.pricingPageDetected && nextSnapshot.pricingPageDetected) {
    changesToInsert.push({
      changeType: "pricing-added",
      title: "Pricing became visible",
      detail: "The latest capture suggests public pricing or plan information is now visible.",
      impact: "medium",
    })
  }

  if (!previousSnapshot.docsDetected && nextSnapshot.docsDetected) {
    changesToInsert.push({
      changeType: "docs-added",
      title: "Public docs detected",
      detail: "The latest capture suggests the product now exposes public docs or developer documentation.",
      impact: "medium",
    })
  }

  if (!previousSnapshot.demoCtaDetected && nextSnapshot.demoCtaDetected) {
    changesToInsert.push({
      changeType: "demo-cta-added",
      title: "Demo CTA added",
      detail: "The conversion flow now appears more sales-assisted than before.",
      impact: "medium",
    })
  }

  if (previousSnapshot.authWallDetected !== nextSnapshot.authWallDetected) {
    changesToInsert.push({
      changeType: "access-flow-changed",
      title: "Access flow changed",
      detail: nextSnapshot.authWallDetected
        ? "The latest capture looks more gated and sign-in oriented than the prior snapshot."
        : "The latest capture looks less gated than the prior snapshot.",
      impact: "medium",
    })
  }

  if (hashValue(previousSnapshot.summary ?? "") !== hashValue(nextSnapshot.summary)) {
    changesToInsert.push({
      changeType: "positioning-refresh",
      title: "Positioning copy changed",
      detail: "The landing page summary changed enough to register as a material positioning update.",
      impact: "low",
    })
  }

  if (changesToInsert.length === 0) {
    return
  }

  await db.insert(projectChanges).values(
    changesToInsert.map((change) => ({
      id: crypto.randomUUID(),
      projectId,
      snapshotId: nextSnapshot.id,
      ...change,
    }))
  )
}

async function detectEvidenceDrivenChanges(
  projectId: string,
  previousSnapshotId: string | null,
  nextSnapshotId: string,
  next: ResearchAnalysis
) {
  if (!previousSnapshotId) {
    return
  }

  const [previousEvidence, nextEvidence] = await Promise.all([
    db
      .select({
        category: projectEvidenceItems.category,
        signalKey: projectEvidenceItems.signalKey,
        value: projectEvidenceItems.value,
      })
      .from(projectEvidenceItems)
      .where(eq(projectEvidenceItems.snapshotId, previousSnapshotId)),
    db
      .select({
        category: projectEvidenceItems.category,
        signalKey: projectEvidenceItems.signalKey,
        value: projectEvidenceItems.value,
      })
      .from(projectEvidenceItems)
      .where(eq(projectEvidenceItems.snapshotId, nextSnapshotId)),
  ])

  const previousSignals = new Set(
    previousEvidence.map((item) => `${item.category}:${item.signalKey}:${item.value}`)
  )
  const nextSignals = new Set(nextEvidence.map((item) => `${item.category}:${item.signalKey}:${item.value}`))

  const addedSignals = [...nextSignals].filter((item) => !previousSignals.has(item))
  const removedSignals = [...previousSignals].filter((item) => !nextSignals.has(item))
  const changesToInsert: Array<{
    changeType: string
    title: string
    detail: string
    impact: string
  }> = []

  if (addedSignals.some((item) => item.includes("pricing-surface")) || removedSignals.some((item) => item.includes("pricing-surface"))) {
    changesToInsert.push({
      changeType: "pricing-surface-changed",
      title: "Pricing surface changed",
      detail: next.pricingPageDetected
        ? "The latest crawl surfaced stronger pricing or plan evidence than the previous snapshot."
        : "Pricing-related evidence weakened or disappeared in the latest crawl.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("cta-label")) || removedSignals.some((item) => item.includes("cta-label"))) {
    changesToInsert.push({
      changeType: "cta-changed",
      title: "CTA profile changed",
      detail: "The observable public call-to-action mix changed between the last two crawls.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("docs-surface")) || removedSignals.some((item) => item.includes("docs-surface"))) {
    changesToInsert.push({
      changeType: "docs-surface-changed",
      title: "Technical surface changed",
      detail: next.docsDetected
        ? "Documentation or API evidence is stronger in the latest crawl."
        : "Documentation or API evidence regressed compared with the prior crawl.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("trust-surface")) || removedSignals.some((item) => item.includes("trust-surface"))) {
    changesToInsert.push({
      changeType: "trust-surface-changed",
      title: "Trust surface changed",
      detail: "Trust, legal, or security cues changed materially across the latest forensic pass.",
      impact: "high",
    })
  }

  if (
    addedSignals.some((item) => item.includes("integration-surface")) ||
    removedSignals.some((item) => item.includes("integration-surface"))
  ) {
    changesToInsert.push({
      changeType: "integration-surface-changed",
      title: "Integration surface changed",
      detail: "Integration or ecosystem cues changed between snapshots.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("auth-wall")) || removedSignals.some((item) => item.includes("auth-wall"))) {
    changesToInsert.push({
      changeType: "auth-gating-changed",
      title: "Auth gating changed",
      detail: next.authWallDetected
        ? "The public surface now appears more gated."
        : "The latest crawl appears less gated than before.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("proof-surface")) || removedSignals.some((item) => item.includes("proof-surface"))) {
    changesToInsert.push({
      changeType: "proof-profile-changed",
      title: "Proof profile changed",
      detail: "Testimonials, case studies, or customer-proof cues changed between crawls.",
      impact: "medium",
    })
  }

  if (addedSignals.some((item) => item.includes("freshness-surface")) || removedSignals.some((item) => item.includes("recent-year-mention"))) {
    changesToInsert.push({
      changeType: "freshness-regression",
      title: "Freshness signals changed",
      detail: "The observable update or release cadence shifted in the latest crawl.",
      impact: "low",
    })
  }

  if (changesToInsert.length === 0) {
    return
  }

  await db.insert(projectChanges).values(
    changesToInsert.map((change) => ({
      id: crypto.randomUUID(),
      projectId,
      snapshotId: nextSnapshotId,
      ...change,
    }))
  )
}

async function rebuildPeerSet(projectId: string) {
  const currentProject = await getResearchProjectsByIds([projectId])
  const target = currentProject[0]

  if (!target) {
    return
  }

  const candidates = (await getResearchProjects()).filter((candidate) => candidate.id !== projectId)
  const peers = candidates
    .map((candidate) => {
      const score =
        (candidate.primaryUseCase === target.primaryUseCase ? 24 : 0) +
        (candidate.buyerType === target.buyerType ? 16 : 0) +
        (candidate.interactionModel === target.interactionModel ? 16 : 0) +
        overlapScore(candidate.aiTools, target.aiTools, 4) +
        overlapScore(candidate.tags, target.tags, 3) +
        (candidate.pricingVisibility === target.pricingVisibility ? 8 : 0) +
        (candidate.deploymentSurface === target.deploymentSurface ? 6 : 0)

      return {
        ...candidate,
        score,
      }
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  await db.delete(projectPeerSets).where(eq(projectPeerSets.projectId, projectId))

  if (peers.length === 0) {
    return
  }

  await db.insert(projectPeerSets).values(
    peers.map((peer) => ({
      projectId,
      peerProjectId: peer.id,
      similarityScore: peer.score,
      rationale: buildPeerRationale(target, peer),
    }))
  )
}

function calculateCredibility({
  project,
  analysis,
  githubSignal,
}: {
  project: {
    verified: boolean
    screenshotCapturedAt: Date | null
    repositoryUrl: string | null
    pricingVisibility: string | null
  }
  analysis: ResearchAnalysis
  githubSignal: GithubSignal
}) {
  const ageDays = project.screenshotCapturedAt
    ? Math.floor((Date.now() - project.screenshotCapturedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  let score = 22
  const reasons: string[] = []

  if (project.verified) {
    score += 18
    reasons.push("verified domain")
  }

  if (ageDays !== null) {
    score += ageDays <= 7 ? 14 : ageDays <= 30 ? 9 : 4
    reasons.push(ageDays <= 30 ? "fresh capture" : "capture present")
  }

  if (analysis.pricingPageDetected) {
    score += 8
    reasons.push("public pricing")
  }

  if (analysis.docsDetected) {
    score += 7
    reasons.push("public docs")
  }

  if (analysis.demoCtaDetected || analysis.selfServeCueDetected) {
    score += 5
  }

  if (project.repositoryUrl) {
    score += 7
    reasons.push("repository linked")
  }

  if (githubSignal.recentlyUpdated) {
    score += 7
    reasons.push("repo recently updated")
  }

  if (analysis.proofPoints.length > 0) {
    score += Math.min(12, analysis.proofPoints.length * 4)
    reasons.push(analysis.proofPoints[0]!.toLowerCase())
  }

  if (
    project.pricingVisibility &&
    ((project.pricingVisibility === "Visible pricing" && analysis.pricingPageDetected) ||
      (project.pricingVisibility === "Contact sales" && analysis.demoCtaDetected))
  ) {
    score += 4
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    summary:
      score >= 80
        ? `High confidence: ${reasons.slice(0, 3).join(", ")}.`
        : score >= 60
          ? `Solid confidence: ${reasons.slice(0, 3).join(", ")}.`
          : `Developing confidence: ${reasons.slice(0, 2).join(", ")}.`,
  }
}

async function getGithubSignal(repositoryUrl: string | null): Promise<GithubSignal> {
  if (!repositoryUrl) {
    return {
      recentlyUpdated: false,
      signalText: null,
    }
  }

  const match = repositoryUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/i)

  if (!match) {
    return {
      recentlyUpdated: false,
      signalText: null,
    }
  }

  const owner = match[1]
  const repo = match[2]?.replace(/\.git$/i, "")

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        accept: "application/vnd.github+json",
        ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(6_000),
    })

    if (!response.ok) {
      return {
        recentlyUpdated: false,
        signalText: null,
      }
    }

    const payload = (await response.json()) as { pushed_at?: string }
    const pushedAt = payload.pushed_at ? new Date(payload.pushed_at) : null

    if (!pushedAt) {
      return {
        recentlyUpdated: false,
        signalText: null,
      }
    }

    const ageDays = Math.floor((Date.now() - pushedAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      recentlyUpdated: ageDays <= 120,
      signalText: ageDays <= 120 ? "Repo updated recently" : "Repo not updated recently",
    }
  } catch {
    return {
      recentlyUpdated: false,
      signalText: null,
    }
  }
}

function inferIcp(lower: string, tags: string[]) {
  if (containsAny(lower, ["developer", "engineering", "api"])) {
    return "Developers"
  }

  if (containsAny(lower, ["support", "ticket", "customer"])) {
    return "Customer support teams"
  }

  if (containsAny(lower, ["sales", "pipeline", "revenue"])) {
    return "Sales teams"
  }

  if (containsAny(lower, ["research", "analysis", "intelligence"])) {
    return "Researchers"
  }

  if (containsAny(lower, ["team", "enterprise", "org", "workspace"])) {
    return "Product teams"
  }

  return (
    tags.find((tag) => containsAny(tag.toLowerCase(), ["developer", "support", "sales", "research"])) ??
    null
  )
}

function inferPrimaryUseCase(lower: string, tags: string[]) {
  if (containsAny(lower, ["agent", "autonomous", "delegate"])) {
    return "AI employee"
  }

  if (containsAny(lower, ["workflow", "automation", "ops"])) {
    return "Workflow automation"
  }

  if (containsAny(lower, ["docs", "knowledge", "wiki"])) {
    return "Knowledge assistant"
  }

  if (containsAny(lower, ["developer", "api", "code"])) {
    return "Developer tooling"
  }

  if (containsAny(lower, ["research", "analysis", "brief"])) {
    return "Research assistant"
  }

  if (containsAny(lower, ["design", "image", "video", "creative"])) {
    return "Creative generation"
  }

  return tags[0] ?? null
}

function inferInteractionModel(lower: string, tags: string[]) {
  if (containsAny(lower, ["copilot"])) {
    return "Copilot"
  }

  if (containsAny(lower, ["search"])) {
    return "Search"
  }

  if (containsAny(lower, ["api"])) {
    return "API"
  }

  if (containsAny(lower, ["workflow", "automation"])) {
    return "Workflow"
  }

  if (containsAny(lower, ["chat", "assistant"])) {
    return "Chat"
  }

  return tags.includes("Developer tools") ? "API" : null
}

function inferDeploymentSurface(lower: string, finalUrl: string) {
  if (containsAny(lower, ["chrome extension", "browser extension"])) {
    return "Extension"
  }

  if (containsAny(lower, ["ios", "android", "mobile app"])) {
    return "Mobile"
  }

  if (containsAny(lower, ["desktop app", "mac app", "windows app"])) {
    return "Desktop"
  }

  if (containsAny(lower, ["slack", "slack app"])) {
    return "Slack"
  }

  return finalUrl.includes("/api") ? "API" : "Web app"
}

function inferModelVendorMix(aiTools: string[]) {
  const tools = aiTools.map((tool) => tool.toLowerCase())

  if (tools.some((tool) => tool.includes("openai")) && tools.length === 1) {
    return "OpenAI-first"
  }

  if (tools.some((tool) => tool.includes("claude") || tool.includes("anthropic")) && tools.length <= 2) {
    return "Anthropic-first"
  }

  if (tools.some((tool) => tool.includes("gemini"))) {
    return "Google-first"
  }

  if (tools.some((tool) => tool.includes("hugging") || tool.includes("ollama"))) {
    return "Open model mix"
  }

  return tools.length > 1 ? "Multi-vendor" : "Unspecified"
}

function buildComparisonNote({
  pricingPageDetected,
  docsDetected,
  demoCtaDetected,
  enterpriseCueDetected,
  selfServeCueDetected,
  proofPoints,
}: {
  pricingPageDetected: boolean
  docsDetected: boolean
  demoCtaDetected: boolean
  enterpriseCueDetected: boolean
  selfServeCueDetected: boolean
  proofPoints: string[]
}) {
  const posture = enterpriseCueDetected
    ? "leans enterprise"
    : selfServeCueDetected
      ? "leans self-serve"
      : "sits between self-serve and enterprise"

  const conversion = pricingPageDetected
    ? "shows pricing openly"
    : demoCtaDetected
      ? "leans on demo conversion"
      : "keeps conversion intent understated"

  const proof = proofPoints.length > 0 ? `signals ${proofPoints[0]!.toLowerCase()}` : "shows limited external proof"

  return `${posture}, ${conversion}, and ${proof}${docsDetected ? " while exposing docs." : "."}`
}

function buildPeerRationale(
  target: ReturnType<typeof normalizeResearchProject>,
  peer: ReturnType<typeof normalizeResearchProject>
) {
  const reasons = normalizeSet([
    target.primaryUseCase && target.primaryUseCase === peer.primaryUseCase
      ? target.primaryUseCase
      : null,
    target.buyerType && target.buyerType === peer.buyerType ? target.buyerType : null,
    target.interactionModel && target.interactionModel === peer.interactionModel
      ? target.interactionModel
      : null,
    target.pricingVisibility && target.pricingVisibility === peer.pricingVisibility
      ? target.pricingVisibility
      : null,
  ])

  return reasons.length > 0
    ? `Shared profile: ${reasons.join(", ")}.`
    : "Similar tool and tag profile."
}

function overlapScore(left: string[], right: string[], weight: number) {
  const overlap = left.filter((value) => right.includes(value)).length
  return overlap * weight
}

function buildCollectionBrief(collection: Awaited<ReturnType<typeof getCollectionDetail>>) {
  if (!collection) {
    return ""
  }

  const items = collection.items
  const publishedItems = items.filter((item) => item.status === PROJECT_STATUS.published)
  const analysisReadyItems = items.filter((item) => !item.analysisPending)
  const proofSignals = items.flatMap((item) => item.proofPoints)
  const statusBreakdown = groupByValue(items.map((item) => item.status))
  const groupedUseCases = groupByValue(items.map((item) => item.primaryUseCase))
  const groupedBuyers = groupByValue(items.map((item) => item.buyerType))
  const groupedPricing = groupByValue(items.map((item) => item.pricingVisibility))
  const groupedStacks = groupByValue(items.flatMap((item) => item.aiTools))
  const groupedOpportunities = groupByValue(
    items.flatMap((item) =>
      item.analysisPending || !item.featureGapSummary ? [] : [item.featureGapSummary.title]
    )
  )
  const averageCredibility =
    publishedItems.length > 0
      ? Math.round(
          publishedItems.reduce((sum, item) => sum + item.credibilityScore, 0) /
            publishedItems.length
        )
      : 0

  return [
    `# ${collection.name}`,
    "",
    collection.description ? collection.description : "Private research collection.",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Snapshot",
    `- Projects: ${items.length}`,
    `- Status mix: ${formatGroupedValues(statusBreakdown)}`,
    `- Published items: ${publishedItems.length}`,
    `- Analysis-ready items: ${analysisReadyItems.length}`,
    `- Average credibility (published only): ${averageCredibility}`,
    `- Top use cases: ${formatGroupedValues(groupedUseCases)}`,
    `- Buyer mix: ${formatGroupedValues(groupedBuyers)}`,
    `- Pricing posture: ${formatGroupedValues(groupedPricing)}`,
    `- Stack patterns: ${formatGroupedValues(groupedStacks)}`,
    `- Feature opportunities: ${formatGroupedValues(groupedOpportunities)}`,
    "",
    "## Collection read",
    items.length > 0
      ? `This set clusters around ${formatGroupedValues(groupedUseCases, 2)} and skews toward ${formatGroupedValues(groupedBuyers, 2)}. Pricing patterns show ${formatGroupedValues(groupedPricing, 2)} while the current workflow mix is ${formatGroupedValues(statusBreakdown, 2)}. High-confidence opportunity areas currently center on ${formatGroupedValues(groupedOpportunities, 2)}.`
      : "No projects have been saved yet.",
    "",
    "## Project notes",
    ...items.map((item) =>
      `- **${item.name}** (${item.status}): ${item.note?.trim() || item.researchSummary || item.shortDescription}${item.analysisPending ? " Analysis is still warming up." : item.featureGapSummary ? ` Recommended next move: ${item.featureGapSummary.title}.` : ""}`
    ),
    "",
    "## Trust and proof",
    `Recurring proof signals: ${summarizeList(normalizeSet(proofSignals).slice(0, 6))}`,
  ].join("\n")
}

function buildFeatureGapRecommendations({
  project,
  analysis,
  credibilitySummary,
}: {
  project: {
    status?: string
    repositoryUrl: string | null
    buyerType?: string | null
    primaryUseCase?: string | null
    interactionModel?: string | null
  }
  analysis: ResearchAnalysis
  credibilitySummary: string
}) {
  const recommendations: Array<{
    featureKey: string
    title: string
    reason: string
    impact: string
    confidence: number
    evidence: string[]
    implementationHint: string
    status: string
  }> = []
  const baseEvidence = analysis.evidenceSnippets.slice(0, 3)
  const supportingEvidence = credibilitySummary ? [credibilitySummary, ...baseEvidence] : baseEvidence
  const lowConfidence = analysis.confidenceScore < 55

  function recommendationConfidence(base: number) {
    return Math.max(35, lowConfidence ? base - 14 : base)
  }

  if (!analysis.pricingPageDetected) {
    recommendations.push({
      featureKey: "public-pricing-surface",
      title: "Add a clearer pricing surface",
      reason: "The current public surface does not expose visible pricing or plan structure, which slows competitive evaluation and self-serve conversion.",
      impact: "high",
      confidence: recommendationConfidence(86),
      evidence: supportingEvidence,
      implementationHint: "Ship a dedicated pricing route or an in-page plan section with entry tier, CTA, and buyer guidance.",
      status: "recommended",
    })
  }

  if (!analysis.docsDetected && !analysis.apiSurfaceDetected && !project.repositoryUrl) {
    recommendations.push({
      featureKey: "developer-proof-surface",
      title: "Expose docs, repo, or technical proof",
      reason: "There is limited technical proof for researchers or developer buyers to validate the product depth.",
      impact: "high",
      confidence: recommendationConfidence(82),
      evidence: supportingEvidence,
      implementationHint: "Add public docs, API reference, or a repository link from the primary navigation or footer.",
      status: "recommended",
    })
  }

  if (analysis.proofPoints.length === 0) {
    recommendations.push({
      featureKey: "trust-proof-blocks",
      title: "Add trust and proof blocks",
      reason: "The landing surface does not show testimonials, customer logos, or visible trust markers.",
      impact: "medium",
      confidence: recommendationConfidence(78),
      evidence: [credibilitySummary, ...analysis.evidenceSnippets].slice(0, 4),
      implementationHint: "Introduce a proof section with customer logos, testimonial cards, or security claims tied to real evidence.",
      status: "recommended",
    })
  }

  if (!analysis.demoCtaDetected && !analysis.selfServeCueDetected) {
    recommendations.push({
      featureKey: "clear-onboarding-path",
      title: "Clarify the first-run onboarding path",
      reason: "The page does not strongly signal whether the product is self-serve or sales-assisted, which makes the next action ambiguous.",
      impact: "medium",
      confidence: recommendationConfidence(74),
      evidence: supportingEvidence,
      implementationHint: "Make the primary CTA explicit: start free, join waitlist, or book demo, and keep it visible above the fold.",
      status: "recommended",
    })
  }

  if (!analysis.enterpriseCueDetected && !analysis.selfServeCueDetected) {
    recommendations.push({
      featureKey: "market-positioning-clarity",
      title: "Strengthen market positioning cues",
      reason: "The surface does not clearly communicate whether the product is built for teams, enterprises, or individual users.",
      impact: "medium",
      confidence: recommendationConfidence(71),
      evidence: supportingEvidence,
      implementationHint: "Add positioning copy, buyer-specific sections, and use-case examples that map to the intended ICP.",
      status: "recommended",
    })
  }

  if (
    project.primaryUseCase === "Developer tooling" &&
    !analysis.integrationCueDetected &&
    !analysis.apiSurfaceDetected
  ) {
    recommendations.push({
      featureKey: "integration-ecosystem",
      title: "Show integration and extensibility hooks",
      reason: "Developer-facing products gain credibility when integrations, webhooks, or extensibility surfaces are visible on the launch path.",
      impact: "high",
      confidence: recommendationConfidence(77),
      evidence: supportingEvidence,
      implementationHint: "Add an integrations section, webhook examples, or a compact API overview linked from the primary navigation.",
      status: "recommended",
    })
  }

  if (
    (
      project.buyerType === "Product teams" ||
      project.buyerType === "Operations teams" ||
      project.buyerType === "Marketing teams" ||
      project.buyerType === "Sales teams" ||
      project.buyerType === "Customer support teams" ||
      project.buyerType === "Enterprises"
    ) &&
    !analysis.collaborationCueDetected
  ) {
    recommendations.push({
      featureKey: "collaboration-surface",
      title: "Expose collaborative workflows",
      reason: "Team-oriented buyers expect shared workflows, roles, or collaboration cues before committing to evaluation.",
      impact: "medium",
      confidence: recommendationConfidence(72),
      evidence: supportingEvidence,
      implementationHint: "Highlight shared workspaces, multi-seat controls, comments, approvals, or handoff flows in the product narrative.",
      status: "recommended",
    })
  }

  if (
    (project.primaryUseCase === "Workflow automation" ||
      project.primaryUseCase === "Customer support" ||
      project.primaryUseCase === "Sales intelligence") &&
    !analysis.analyticsCueDetected
  ) {
    recommendations.push({
      featureKey: "analytics-feedback-loop",
      title: "Add reporting and feedback-loop visibility",
      reason: "Outcome-driven products feel more credible when dashboards, metrics, or measurable results are visible in the launch story.",
      impact: "medium",
      confidence: recommendationConfidence(68),
      evidence: supportingEvidence,
      implementationHint: "Add an analytics or reporting section that shows what users can measure after setup.",
      status: "recommended",
    })
  }

  if (
    !analysis.compareSurfaceDetected &&
    (project.primaryUseCase === "Research assistant" ||
      project.primaryUseCase === "Data analysis")
  ) {
    recommendations.push({
      featureKey: "compare-or-benchmark-surface",
      title: "Add a compare or benchmark surface",
      reason: "Research-oriented products become easier to evaluate when buyers can compare outputs, vendors, or workflows directly.",
      impact: "medium",
      confidence: recommendationConfidence(64),
      evidence: supportingEvidence,
      implementationHint: "Introduce a compare page, benchmark block, or side-by-side workflow examples tied to the core product promise.",
      status: "recommended",
    })
  }

  if (project.status !== PROJECT_STATUS.published) {
    recommendations.push({
      featureKey: "publish-readiness",
      title: "Stabilize launch surface before publish",
      reason: "The project is not yet fully published in the gallery, so analysis confidence is partially constrained by the current submission state.",
      impact: "medium",
      confidence: recommendationConfidence(63),
      evidence: [`Current project status: ${project.status ?? "unknown"}`],
      implementationHint: "Prioritize landing-page stability, screenshot readiness, and essential metadata before iterating on advanced distribution features.",
      status: "pending",
    })
  }

  return recommendations
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 6)
}

async function persistFeatureGaps(
  projectId: string,
  recommendations: ReturnType<typeof buildFeatureGapRecommendations>
) {
  await db.delete(projectFeatureGaps).where(eq(projectFeatureGaps.projectId, projectId))

  if (recommendations.length === 0) {
    return
  }

  const now = new Date()

  await db.insert(projectFeatureGaps).values(
    recommendations.map((recommendation) => ({
      projectId,
      featureKey: recommendation.featureKey,
      title: recommendation.title,
      reason: recommendation.reason,
      impact: recommendation.impact,
      confidence: recommendation.confidence,
      evidence: recommendation.evidence,
      implementationHint: recommendation.implementationHint,
      status: recommendation.status,
      updatedAt: now,
    }))
  )
}

function groupByValue(values: Array<string | null | undefined>) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    if (!value) {
      return accumulator
    }

    accumulator[value] = (accumulator[value] ?? 0) + 1
    return accumulator
  }, {})
}

function formatGroupedValues(values: Record<string, number>, limit = 3) {
  const entries = Object.entries(values).sort((left, right) => right[1] - left[1]).slice(0, limit)

  if (entries.length === 0) {
    return "No signal yet"
  }

  return entries.map(([label, count]) => `${label} (${count})`).join(", ")
}

function containsAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle))
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function normalizeRadarTarget(target: RadarTargetRow) {
  return {
    ...target,
    proofPoints: target.proofPoints ?? [],
    evidenceSnippets: target.evidenceSnippets ?? [],
  }
}

export async function createRadarTarget({
  userId,
  appUrl,
}: {
  userId: string
  appUrl: string
}) {
  await ensureDefaultMarketMaps()
  const normalizedAppUrl = await normalizePublicUrl(appUrl)

  const existingTarget = await db
    .select({ id: radarTargets.id, slug: radarTargets.slug, projectId: radarTargets.projectId })
    .from(radarTargets)
    .where(eq(radarTargets.normalizedAppUrl, normalizedAppUrl))
    .limit(1)

  if (existingTarget[0]) {
    return {
      targetId: existingTarget[0].id,
      slug: existingTarget[0].slug,
      existed: true,
      projectId: existingTarget[0].projectId,
    }
  }

  const existingProject = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.normalizedAppUrl, normalizedAppUrl))
    .limit(1)

  if (existingProject[0]) {
    await syncRadarTargetFromProject(existingProject[0].id)

    const syncedTarget = await db
      .select({ id: radarTargets.id, slug: radarTargets.slug, projectId: radarTargets.projectId })
      .from(radarTargets)
      .where(eq(radarTargets.normalizedAppUrl, normalizedAppUrl))
      .limit(1)

    return {
      targetId: syncedTarget[0]!.id,
      slug: syncedTarget[0]!.slug,
      existed: false,
      projectId: syncedTarget[0]!.projectId,
    }
  }

  const hostname = getHostnameFromUrl(normalizedAppUrl)
  const targetId = crypto.randomUUID()
  const now = new Date()

  await db.insert(radarTargets).values({
    id: targetId,
    slug: `${slugifyTerm(hostname) || "radar-target"}-${targetId.slice(0, 8)}`,
    name: hostname.replace(/^www\./, ""),
    appUrl: normalizedAppUrl,
    normalizedAppUrl,
    createdByUserId: userId,
    firstDetectedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  const target = await db
    .select({ id: radarTargets.id, slug: radarTargets.slug, projectId: radarTargets.projectId })
    .from(radarTargets)
    .where(eq(radarTargets.id, targetId))
    .limit(1)

  return {
    targetId,
    slug: target[0]!.slug,
    existed: false,
    projectId: target[0]!.projectId,
  }
}

export async function getRadarTargets() {
  const allTargets = await db
    .select(radarSelection)
    .from(radarTargets)
    .orderBy(desc(radarTargets.credibilityScore), desc(radarTargets.updatedAt))

  const normalizedTargets = allTargets.map(normalizeRadarTarget)

  return {
    recentlyDetected: [...normalizedTargets]
      .sort((left, right) => right.firstDetectedAt.getTime() - left.firstDetectedAt.getTime())
      .slice(0, 12),
    recentlyChanged: normalizedTargets
      .filter((target) => target.lastChangedAt)
      .sort(
        (left, right) =>
          (right.lastChangedAt?.getTime() ?? 0) - (left.lastChangedAt?.getTime() ?? 0)
      )
      .slice(0, 12),
    needsClaim: normalizedTargets
      .filter((target) => target.needsClaim && !target.projectId && target.status !== "suppressed")
      .sort((left, right) => right.credibilityScore - left.credibilityScore)
      .slice(0, 12),
  }
}

export async function getRadarTargetBySlug(slug: string) {
  const target = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(eq(radarTargets.slug, slug))
    .limit(1)

  return target[0] ? normalizeRadarTarget(target[0]) : null
}

export async function getRadarTargetNarrative(targetId: string, limit = 24) {
  return db
    .select({
      id: narrativeEvents.id,
      eventKey: narrativeEvents.eventKey,
      title: narrativeEvents.title,
      detail: narrativeEvents.detail,
      impact: narrativeEvents.impact,
      detectedAt: narrativeEvents.detectedAt,
    })
    .from(narrativeEvents)
    .where(eq(narrativeEvents.radarTargetId, targetId))
    .orderBy(desc(narrativeEvents.detectedAt))
    .limit(limit)
}

export async function refreshRadarTarget(targetId: string) {
  await ensureDefaultMarketMaps()

  const target = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(eq(radarTargets.id, targetId))
    .limit(1)

  const currentTarget = target[0]

  if (!currentTarget) {
    return
  }

  const htmlResult = await fetchProjectHtml(currentTarget.appUrl)
  const screenshot = await captureAndUploadScreenshot({
    appUrl: currentTarget.appUrl,
    slug: `radar-${currentTarget.slug}-${Date.now()}`,
  }).catch(() => null)
  const analysis = analyzeHtml({
    project: {
      name: currentTarget.name,
      shortDescription: currentTarget.researchSummary ?? currentTarget.name,
      appUrl: currentTarget.appUrl,
      aiTools: [],
      tags: [],
      primaryUseCase: currentTarget.primaryUseCase,
      buyerType: currentTarget.buyerType,
      interactionModel: currentTarget.interactionModel,
      pricingVisibility: currentTarget.pricingVisibility,
      deploymentSurface: currentTarget.deploymentSurface,
      modelVendorMix: currentTarget.modelVendorMix,
    },
    html: htmlResult.html,
    finalUrl: htmlResult.finalUrl,
    screenshotUrl: screenshot?.screenshotUrl ?? currentTarget.screenshotUrl,
  })
  const credibility = calculateCredibility({
    project: {
      ...currentTarget,
      repositoryUrl: null,
      verified: Boolean(currentTarget.projectId),
    },
    analysis,
    githubSignal: {
      recentlyUpdated: false,
      signalText: null,
    },
  })
  const now = new Date()

  await db
    .update(radarTargets)
    .set({
      name: resolveRadarName(analysis.pageTitle, currentTarget.appUrl),
      screenshotUrl: screenshot?.screenshotUrl ?? currentTarget.screenshotUrl,
      screenshotFileKey: screenshot?.screenshotFileKey ?? currentTarget.screenshotFileKey,
      screenshotCapturedAt: screenshot ? now : currentTarget.screenshotCapturedAt,
      primaryUseCase: currentTarget.primaryUseCase ?? analysis.inferredPrimaryUseCase,
      buyerType: currentTarget.buyerType ?? analysis.inferredBuyerType,
      interactionModel: currentTarget.interactionModel ?? analysis.inferredInteractionModel,
      pricingVisibility: currentTarget.pricingVisibility ?? analysis.inferredPricingVisibility,
      deploymentSurface:
        currentTarget.deploymentSurface ?? analysis.inferredDeploymentSurface,
      modelVendorMix: currentTarget.modelVendorMix ?? analysis.inferredModelVendorMix,
      primaryHeadline: analysis.primaryHeadline,
      researchSummary: analysis.researchSummary,
      likelyIcp: analysis.likelyIcp,
      comparisonNote: analysis.comparisonNote,
      pricingPageDetected: analysis.pricingPageDetected,
      docsDetected: analysis.docsDetected,
      demoCtaDetected: analysis.demoCtaDetected,
      authWallDetected: analysis.authWallDetected,
      enterpriseCueDetected: analysis.enterpriseCueDetected,
      selfServeCueDetected: analysis.selfServeCueDetected,
      integrationCueDetected: analysis.integrationCueDetected,
      collaborationCueDetected: analysis.collaborationCueDetected,
      analyticsCueDetected: analysis.analyticsCueDetected,
      apiSurfaceDetected: analysis.apiSurfaceDetected,
      compareSurfaceDetected: analysis.compareSurfaceDetected,
      proofPoints: analysis.proofPoints,
      evidenceSnippets: analysis.evidenceSnippets,
      confidenceScore: analysis.confidenceScore,
      credibilityScore: credibility.score,
      credibilitySummary: credibility.summary,
      lastAnalyzedAt: now,
      lastChangedAt:
        hasRadarStrategicChange(currentTarget, analysis) ? now : currentTarget.lastChangedAt,
      nextPulseDueAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      needsClaim: !currentTarget.projectId,
      updatedAt: now,
    })
    .where(eq(radarTargets.id, currentTarget.id))

  await persistNarrativeEvents(
    currentTarget,
    {
      ...analysis,
      credibilitySummary: credibility.summary ?? "Signal confidence updated.",
    },
    now
  )
  await rebuildMarketMaps()
  await rebuildOpportunityClusters()
}

export async function syncDueRadarResearch(limit = 12) {
  const dueTargets = await db
    .select({ id: radarTargets.id })
    .from(radarTargets)
    .where(
      and(
        or(lte(radarTargets.nextPulseDueAt, new Date()), isNull(radarTargets.nextPulseDueAt)),
        ne(radarTargets.status, "suppressed")
      )
    )
    .orderBy(asc(radarTargets.nextPulseDueAt), desc(radarTargets.credibilityScore))
    .limit(limit)

  for (const target of dueTargets) {
    await refreshRadarTarget(target.id).catch(() => null)
  }

  return dueTargets.length
}

export async function getMarketMaps() {
  await ensureDefaultMarketMaps()
  const maps = await db
    .select({
      id: marketMaps.id,
      slug: marketMaps.slug,
      title: marketMaps.title,
      summary: marketMaps.summary,
      updatedAt: marketMaps.updatedAt,
    })
    .from(marketMaps)
    .where(eq(marketMaps.isPublic, true))
    .orderBy(asc(marketMaps.title))

  const memberships = await db
    .select({
      mapId: marketMapMemberships.mapId,
    })
    .from(marketMapMemberships)

  return maps.map((map) => ({
    ...map,
    memberCount: memberships.filter((membership) => membership.mapId === map.id).length,
  }))
}

export async function getMarketMapBySlug(slug: string) {
  await ensureDefaultMarketMaps()
  const map = await db
    .select()
    .from(marketMaps)
    .where(and(eq(marketMaps.slug, slug), eq(marketMaps.isPublic, true)))
    .limit(1)

  if (!map[0]) {
    return null
  }

  const members = await db
    .select({
      clusterLabel: marketMapMemberships.clusterLabel,
      clusterScore: marketMapMemberships.clusterScore,
      rationale: marketMapMemberships.rationale,
      ...radarSelection,
    })
    .from(marketMapMemberships)
    .innerJoin(radarTargets, eq(radarTargets.id, marketMapMemberships.radarTargetId))
    .where(eq(marketMapMemberships.mapId, map[0].id))
    .orderBy(desc(marketMapMemberships.clusterScore), desc(radarTargets.credibilityScore))

  const normalizedMembers = members.map((member) => ({
    ...normalizeRadarTarget(member),
    clusterLabel: member.clusterLabel,
    clusterScore: member.clusterScore,
    rationale: member.rationale,
  }))
  const clusterBreakdown = groupByValue(normalizedMembers.map((member) => member.clusterLabel))
  const missingArchetypes = computeMissingArchetypes(slug, normalizedMembers)

  return {
    ...map[0],
    members: normalizedMembers,
    notableMovers: normalizedMembers
      .filter((member) => member.lastChangedAt)
      .sort(
        (left, right) =>
          (right.lastChangedAt?.getTime() ?? 0) - (left.lastChangedAt?.getTime() ?? 0)
      )
      .slice(0, 4),
    clusterBreakdown,
    missingArchetypes,
  }
}

export async function getOpportunityClusters() {
  await rebuildOpportunityClusters()

  return db
    .select()
    .from(opportunityClusters)
    .orderBy(desc(opportunityClusters.targetCount), desc(opportunityClusters.updatedAt))
}

export async function claimRadarTarget({
  targetId,
  userId,
  organizationId,
}: {
  targetId: string
  userId: string
  organizationId: string
}) {
  const target = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(eq(radarTargets.id, targetId))
    .limit(1)

  const currentTarget = target[0]

  if (!currentTarget) {
    return { ok: false as const, error: "not-found" as const }
  }

  if (currentTarget.projectId) {
    return {
      ok: true as const,
      projectId: currentTarget.projectId,
      existed: true,
    }
  }

  const duplicate = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.normalizedAppUrl, currentTarget.normalizedAppUrl))
    .limit(1)

  if (duplicate[0]) {
    await db
      .update(radarTargets)
      .set({
        projectId: duplicate[0].id,
        status: "published_submission",
        needsClaim: false,
        updatedAt: new Date(),
      })
      .where(eq(radarTargets.id, currentTarget.id))

    return {
      ok: true as const,
      projectId: duplicate[0].id,
      existed: true,
    }
  }

  const projectId = crypto.randomUUID()
  const now = new Date()
  const status = currentTarget.screenshotUrl ? PROJECT_STATUS.published : PROJECT_STATUS.processing

  await db.insert(projects).values({
    id: projectId,
    slug: createProjectSlug(currentTarget.name),
    name: currentTarget.name,
    shortDescription: buildClaimDescription(currentTarget),
    appUrl: currentTarget.appUrl,
    normalizedAppUrl: currentTarget.normalizedAppUrl,
    repositoryUrl: null,
    aiTools: [],
    tags: [],
    primaryUseCase: currentTarget.primaryUseCase,
    buyerType: currentTarget.buyerType,
    interactionModel: currentTarget.interactionModel,
    pricingVisibility: currentTarget.pricingVisibility,
    deploymentSurface: currentTarget.deploymentSurface,
    modelVendorMix: currentTarget.modelVendorMix,
    status,
    screenshotUrl: currentTarget.screenshotUrl,
    screenshotFileKey: currentTarget.screenshotFileKey,
    screenshotCapturedAt: currentTarget.screenshotCapturedAt,
    processingError: null,
    verificationToken: randomBytes(24).toString("hex"),
    verified: false,
    credibilityScore: currentTarget.credibilityScore,
    credibilitySummary: currentTarget.credibilitySummary,
    lastAnalyzedAt: currentTarget.lastAnalyzedAt,
    nextPulseDueAt: currentTarget.nextPulseDueAt,
    createdAt: now,
    updatedAt: now,
    publishedAt: status === PROJECT_STATUS.published ? now : null,
    organizationId,
    createdByUserId: userId,
  })

  await db.insert(productClaims).values({
    id: crypto.randomUUID(),
    radarTargetId: currentTarget.id,
    projectId,
    claimedByUserId: userId,
    organizationId,
    status: "claimed",
    createdAt: now,
    updatedAt: now,
  })

  await db
    .update(radarTargets)
    .set({
      projectId,
      status: status === PROJECT_STATUS.published ? "published_submission" : "claimed",
      needsClaim: false,
      updatedAt: now,
    })
    .where(eq(radarTargets.id, currentTarget.id))

  return {
    ok: true as const,
    projectId,
    existed: false,
  }
}

async function syncRadarTargetFromProject(projectId: string) {
  const project = await db
    .select(projectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(eq(projects.id, projectId))
    .limit(1)

  const currentProject = project[0]

  if (!currentProject) {
    return
  }

  const previous = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(eq(radarTargets.normalizedAppUrl, currentProject.normalizedAppUrl))
    .limit(1)

  const now = new Date()
  const normalizedProject = normalizeResearchProject(currentProject)

  await db
    .insert(radarTargets)
    .values({
      id: previous[0]?.id ?? crypto.randomUUID(),
      slug: previous[0]?.slug ?? createRadarSlug(currentProject.name),
      name: currentProject.name,
      appUrl: currentProject.appUrl,
      normalizedAppUrl: currentProject.normalizedAppUrl,
      status:
        currentProject.status === PROJECT_STATUS.published ? "published_submission" : "claimed",
      source: "submission",
      screenshotUrl: currentProject.screenshotUrl,
      screenshotFileKey: currentProject.screenshotFileKey,
      screenshotCapturedAt: currentProject.screenshotCapturedAt,
      primaryUseCase: normalizedProject.primaryUseCase,
      buyerType: normalizedProject.buyerType,
      interactionModel: normalizedProject.interactionModel,
      pricingVisibility: normalizedProject.pricingVisibility,
      deploymentSurface: normalizedProject.deploymentSurface,
      modelVendorMix: normalizedProject.modelVendorMix,
      primaryHeadline: normalizedProject.primaryHeadline,
      researchSummary: normalizedProject.researchSummary,
      likelyIcp: normalizedProject.likelyIcp,
      comparisonNote: normalizedProject.comparisonNote,
      pricingPageDetected: normalizedProject.pricingPageDetected,
      docsDetected: normalizedProject.docsDetected,
      demoCtaDetected: normalizedProject.demoCtaDetected,
      authWallDetected: normalizedProject.authWallDetected,
      enterpriseCueDetected: normalizedProject.enterpriseCueDetected,
      selfServeCueDetected: normalizedProject.selfServeCueDetected,
      integrationCueDetected: false,
      collaborationCueDetected: false,
      analyticsCueDetected: false,
      apiSurfaceDetected: normalizedProject.docsDetected,
      compareSurfaceDetected: false,
      proofPoints: normalizedProject.proofPoints,
      evidenceSnippets: normalizedProject.evidenceSnippets,
      confidenceScore: normalizedProject.confidenceScore,
      credibilityScore: normalizedProject.credibilityScore,
      credibilitySummary: normalizedProject.credibilitySummary,
      firstDetectedAt: previous[0]?.firstDetectedAt ?? currentProject.createdAt,
      lastChangedAt: previous[0]?.lastChangedAt,
      lastAnalyzedAt: normalizedProject.lastAnalyzedAt,
      nextPulseDueAt: normalizedProject.nextPulseDueAt,
      needsClaim: false,
      projectId: normalizedProject.id,
      createdByUserId: currentProject.createdByUserId,
      createdAt: previous[0]?.createdAt ?? now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: radarTargets.normalizedAppUrl,
      set: {
        name: currentProject.name,
        status:
          currentProject.status === PROJECT_STATUS.published
            ? "published_submission"
            : "claimed",
        source: "submission",
        screenshotUrl: currentProject.screenshotUrl,
        screenshotFileKey: currentProject.screenshotFileKey,
        screenshotCapturedAt: currentProject.screenshotCapturedAt,
        primaryUseCase: normalizedProject.primaryUseCase,
        buyerType: normalizedProject.buyerType,
        interactionModel: normalizedProject.interactionModel,
        pricingVisibility: normalizedProject.pricingVisibility,
        deploymentSurface: normalizedProject.deploymentSurface,
        modelVendorMix: normalizedProject.modelVendorMix,
        primaryHeadline: normalizedProject.primaryHeadline,
        researchSummary: normalizedProject.researchSummary,
        likelyIcp: normalizedProject.likelyIcp,
        comparisonNote: normalizedProject.comparisonNote,
        pricingPageDetected: normalizedProject.pricingPageDetected,
        docsDetected: normalizedProject.docsDetected,
        demoCtaDetected: normalizedProject.demoCtaDetected,
        authWallDetected: normalizedProject.authWallDetected,
        enterpriseCueDetected: normalizedProject.enterpriseCueDetected,
        selfServeCueDetected: normalizedProject.selfServeCueDetected,
        apiSurfaceDetected: normalizedProject.docsDetected,
        proofPoints: normalizedProject.proofPoints,
        evidenceSnippets: normalizedProject.evidenceSnippets,
        confidenceScore: normalizedProject.confidenceScore,
        credibilityScore: normalizedProject.credibilityScore,
        credibilitySummary: normalizedProject.credibilitySummary,
        lastAnalyzedAt: normalizedProject.lastAnalyzedAt,
        nextPulseDueAt: normalizedProject.nextPulseDueAt,
        needsClaim: false,
        projectId: normalizedProject.id,
        updatedAt: now,
      },
    })

  await rebuildMarketMaps()
  await rebuildOpportunityClusters()
}

async function rebuildMarketMaps() {
  await ensureDefaultMarketMaps()
  const maps = await db.select().from(marketMaps)
  const targets = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(ne(radarTargets.status, "suppressed"))

  await db.delete(marketMapMemberships)

  const memberships = maps.flatMap((map) =>
    targets
      .filter((target) => matchesMarketMap(map.slug, target))
      .map((target) => ({
        mapId: map.id,
        radarTargetId: target.id,
        clusterLabel:
          target.primaryUseCase ?? target.buyerType ?? target.pricingVisibility ?? "General",
        clusterScore: Math.round((target.credibilityScore + target.confidenceScore) / 2),
        rationale: `${target.primaryUseCase ?? "Unlabeled"} / ${target.pricingVisibility ?? "Unknown pricing"}`,
        createdAt: new Date(),
      }))
  )

  if (memberships.length > 0) {
    await db.insert(marketMapMemberships).values(memberships)
  }

  await db
    .update(marketMaps)
    .set({
      updatedAt: new Date(),
    })
}

async function rebuildOpportunityClusters() {
  const targets = await db
    .select(radarSelection)
    .from(radarTargets)
    .where(ne(radarTargets.status, "suppressed"))

  const clusterDefinitions = [
    {
      slug: "pricing-opacity-gap",
      title: "Pricing opacity gap",
      summary:
        "A meaningful share of tracked products still hides pricing, making competitive evaluation harder than it should be.",
      impact: "high",
      targets: targets.filter(
        (target) =>
          !target.pricingPageDetected &&
          (!target.pricingVisibility || target.pricingVisibility === "Unknown")
      ),
    },
    {
      slug: "trust-proof-gap",
      title: "Trust proof gap",
      summary:
        "Products are gaining visibility before they show enough external proof, which creates a market opportunity for clearer trust surfaces.",
      impact: "high",
      targets: targets.filter(
        (target) => target.credibilityScore < 60 && (target.proofPoints?.length ?? 0) === 0
      ),
    },
    {
      slug: "developer-docs-gap",
      title: "Developer docs gap",
      summary:
        "Developer-facing products are shipping without public docs or API posture, weakening adoption and comparison.",
      impact: "medium",
      targets: targets.filter(
        (target) =>
          target.primaryUseCase === "Developer tooling" &&
          !target.docsDetected &&
          !target.apiSurfaceDetected
      ),
    },
    {
      slug: "positioning-clarity-gap",
      title: "Positioning clarity gap",
      summary:
        "Several products still do not communicate a sharp buyer or workflow, leaving whitespace for clearer positioning.",
      impact: "medium",
      targets: targets.filter(
        (target) =>
          (!target.primaryUseCase || !target.buyerType) && target.confidenceScore < 70
      ),
    },
    {
      slug: "unclaimed-rising-targets",
      title: "Unclaimed rising targets",
      summary:
        "Higher-signal products are appearing in radar before founders claim or enrich them, creating a growth opportunity for the gallery.",
      impact: "medium",
      targets: targets.filter((target) => !target.projectId && target.credibilityScore >= 55),
    },
  ]

  await db.delete(opportunityClusters)

  const now = new Date()
  const rows = clusterDefinitions
    .filter((cluster) => cluster.targets.length > 0)
    .map((cluster) => ({
      id: `opportunity_${cluster.slug}`,
      slug: cluster.slug,
      title: cluster.title,
      summary: cluster.summary,
      evidence: cluster.targets.slice(0, 4).map((target) => target.name),
      impact: cluster.impact,
      targetCount: cluster.targets.length,
      createdAt: now,
      updatedAt: now,
    }))

  if (rows.length > 0) {
    await db.insert(opportunityClusters).values(rows)
  }
}

async function persistNarrativeEvents(
  previous: RadarTargetRow,
  next: ResearchAnalysis & { credibilitySummary: string },
  detectedAt: Date
) {
  const events = buildNarrativeEvents(previous, next, detectedAt)

  if (events.length === 0) {
    return
  }

  await db.insert(narrativeEvents).values(
    events.map((event) => ({
      id: crypto.randomUUID(),
      radarTargetId: previous.id,
      projectId: previous.projectId,
      eventKey: event.eventKey,
      title: event.title,
      detail: event.detail,
      impact: event.impact,
      detectedAt,
    }))
  )
}

function buildNarrativeEvents(
  previous: RadarTargetRow,
  next: ResearchAnalysis & { credibilitySummary: string },
  detectedAt: Date
) {
  const events: Array<{
    eventKey: string
    title: string
    detail: string
    impact: string
    detectedAt: Date
  }> = []

  if (!previous.pricingPageDetected && next.pricingPageDetected) {
    events.push({
      eventKey: "pricing-introduced",
      title: "Pricing introduced",
      detail: "The latest capture exposes pricing more clearly than the previous public surface.",
      impact: "high",
      detectedAt,
    })
  }

  if (!previous.docsDetected && next.docsDetected) {
    events.push({
      eventKey: "docs-launched",
      title: "Docs launched",
      detail: "Public documentation or API guidance is now visible on the product surface.",
      impact: "high",
      detectedAt,
    })
  }

  if (!previous.compareSurfaceDetected && next.compareSurfaceDetected) {
    events.push({
      eventKey: "comparison-page-introduced",
      title: "Comparison page introduced",
      detail: "The product now signals benchmarking or compare-style messaging in its launch flow.",
      impact: "medium",
      detectedAt,
    })
  }

  if (
    previous.selfServeCueDetected &&
    !previous.enterpriseCueDetected &&
    next.enterpriseCueDetected &&
    !next.selfServeCueDetected
  ) {
    events.push({
      eventKey: "enterprise-shift-detected",
      title: "Self-serve to enterprise shift",
      detail: "The launch posture now leans more enterprise than self-serve.",
      impact: "high",
      detectedAt,
    })
  }

  if ((previous.proofPoints?.length ?? 0) === 0 && next.proofPoints.length > 0) {
    events.push({
      eventKey: "proof-section-added",
      title: "Proof section added",
      detail: "The latest capture adds testimonials, customer proof, or other trust markers.",
      impact: "medium",
      detectedAt,
    })
  }

  if (
    previous.primaryHeadline &&
    next.primaryHeadline &&
    previous.primaryHeadline.trim().toLowerCase() !== next.primaryHeadline.trim().toLowerCase()
  ) {
    events.push({
      eventKey: "positioning-rewritten",
      title: "Positioning rewritten",
      detail: `Headline changed from "${previous.primaryHeadline}" to "${next.primaryHeadline}".`,
      impact: "medium",
      detectedAt,
    })
  }

  if (
    previous.demoCtaDetected !== next.demoCtaDetected ||
    previous.selfServeCueDetected !== next.selfServeCueDetected
  ) {
    events.push({
      eventKey: "onboarding-path-changed",
      title: "Onboarding path changed",
      detail: "The first-run conversion or onboarding posture changed between captures.",
      impact: "medium",
      detectedAt,
    })
  }

  return events
}

function hasRadarStrategicChange(previous: RadarTargetRow, next: ResearchAnalysis) {
  return (
    previous.pricingPageDetected !== next.pricingPageDetected ||
    previous.docsDetected !== next.docsDetected ||
    previous.demoCtaDetected !== next.demoCtaDetected ||
    previous.enterpriseCueDetected !== next.enterpriseCueDetected ||
    previous.selfServeCueDetected !== next.selfServeCueDetected ||
    previous.compareSurfaceDetected !== next.compareSurfaceDetected ||
    previous.primaryHeadline !== next.primaryHeadline
  )
}

function resolveRadarName(pageTitle: string | null, appUrl: string) {
  if (pageTitle?.trim()) {
    return pageTitle.split(/[|\-]/)[0]!.trim().slice(0, 80)
  }

  return getHostnameFromUrl(appUrl).replace(/^www\./, "")
}

function createRadarSlug(name: string) {
  return `${slugifyTerm(name) || "radar-target"}-${crypto.randomUUID().slice(0, 8)}`
}

function buildClaimDescription(target: RadarTargetRow) {
  const candidate =
    target.researchSummary ??
    target.primaryHeadline ??
    `${target.name} is being upgraded from open radar monitoring into a richer claimed research profile.`

  return candidate.length >= 24 ? candidate.slice(0, 220) : `${candidate} Built from monitored public launch signals.`.slice(0, 220)
}

function matchesMarketMap(mapSlug: string, target: RadarTargetRow) {
  switch (mapSlug) {
    case "ai-coding":
      return (
        target.primaryUseCase === "Developer tooling" || target.buyerType === "Developers"
      )
    case "customer-support":
      return (
        target.primaryUseCase === "Customer support" ||
        target.buyerType === "Customer support teams"
      )
    case "research-assistants":
      return (
        target.primaryUseCase === "Research assistant" ||
        target.primaryUseCase === "Data analysis"
      )
    case "workflow-automation":
      return (
        target.primaryUseCase === "Workflow automation" ||
        target.primaryUseCase === "AI employee" ||
        target.buyerType === "Operations teams"
      )
    case "enterprise-watchlist":
      return (
        target.buyerType === "Enterprises" ||
        target.enterpriseCueDetected ||
        target.pricingVisibility === "Contact sales" ||
        target.pricingVisibility === "Demo required"
      )
    default:
      return false
  }
}

function computeMissingArchetypes(
  mapSlug: string,
  members: Array<RadarTargetRow & { clusterLabel: string }>
) {
  const missing: string[] = []

  if (members.every((member) => !member.pricingPageDetected)) {
    missing.push("Transparent pricing archetype")
  }

  if (mapSlug === "ai-coding" && members.every((member) => !member.docsDetected)) {
    missing.push("Public docs leader")
  }

  if (members.every((member) => !member.projectId)) {
    missing.push("Founder-claimed flagship profile")
  }

  if (members.every((member) => member.proofPoints.length === 0)) {
    missing.push("Trust-rich category leader")
  }

  return missing
}
