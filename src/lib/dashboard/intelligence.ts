import { and, desc, eq, gte, isNotNull } from "drizzle-orm"

import { db } from "@/lib/db"
import { projectChanges, projects, projectSignals, projectSnapshots, user } from "@/lib/db/schema"
import { buildArchitectureEvidence } from "@/lib/dashboard/dossier-utils"
import { canManageProject } from "@/lib/organizations/access"
import { PROJECT_STATUS } from "@/lib/projects/types"
import {
  getProjectFeatureGaps,
  getProjectForensics,
  getProjectPeers,
  getProjectStrategyTimeline,
  getProjectTimeline,
} from "@/lib/research/service"

type DashboardProjectRow = {
  id: string
  slug: string
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
  status: string
  screenshotUrl: string | null
  verified: boolean
  credibilityScore: number
  credibilitySummary: string | null
  lastAnalyzedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  createdByUserId: string
  authorName: string
  researchSummary: string | null
  likelyIcp: string | null
  primaryHeadline: string | null
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

type NormalizedDashboardProject = Omit<
  DashboardProjectRow,
  | "pagesVisited"
  | "coverageScore"
  | "marketClarityScore"
  | "conversionScore"
  | "trustScore"
  | "technicalDepthScore"
  | "proofScore"
  | "freshnessScore"
  | "pricingPageDetected"
  | "docsDetected"
  | "demoCtaDetected"
  | "authWallDetected"
  | "enterpriseCueDetected"
  | "selfServeCueDetected"
  | "proofPoints"
  | "evidenceSnippets"
  | "confidenceScore"
> & {
  pagesVisited: number
  coverageScore: number
  marketClarityScore: number
  conversionScore: number
  trustScore: number
  technicalDepthScore: number
  proofScore: number
  freshnessScore: number
  pricingPageDetected: boolean
  docsDetected: boolean
  demoCtaDetected: boolean
  authWallDetected: boolean
  enterpriseCueDetected: boolean
  selfServeCueDetected: boolean
  proofPoints: string[]
  evidenceSnippets: string[]
  confidenceScore: number
}

type DossierActor = {
  organizationId: string
  role: string
  userId: string
}

type CapabilityDefinition = {
  key: string
  label: string
  shortLabel: string
  category: string
  summary: string
}

export type CapabilityGenomeEntry = CapabilityDefinition & {
  confidence: number
  state: "observed" | "inferred" | "emerging" | "absent"
  evidence: string[]
}

export type DashboardGenomeProject = NormalizedDashboardProject & {
  capabilityCount: number
  capabilities: CapabilityGenomeEntry[]
}

export type TimeMachinePoint = {
  label: string
  docsShare: number
  pricingShare: number
  demoShare: number
  sampleSize: number
}

export type TimeMachineCategory = {
  label: string
  projectCount: number
  averageCredibility: number
  changeVelocity: number
  latestDocsShare: number
  latestPricingShare: number
  latestDemoShare: number
  docsDelta: number
  pricingDelta: number
  demoDelta: number
  timeline: TimeMachinePoint[]
}

const dashboardProjectSelection = {
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
  status: projects.status,
  screenshotUrl: projects.screenshotUrl,
  verified: projects.verified,
  credibilityScore: projects.credibilityScore,
  credibilitySummary: projects.credibilitySummary,
  lastAnalyzedAt: projects.lastAnalyzedAt,
  publishedAt: projects.publishedAt,
  createdAt: projects.createdAt,
  createdByUserId: projects.createdByUserId,
  authorName: user.name,
  researchSummary: projectSignals.researchSummary,
  likelyIcp: projectSignals.likelyIcp,
  primaryHeadline: projectSignals.primaryHeadline,
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

const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  { key: "rag", label: "Retrieval layer", shortLabel: "RAG", category: "knowledge", summary: "Grounding in search, documents, or internal knowledge." },
  { key: "agent", label: "Agent loop", shortLabel: "Agent", category: "orchestration", summary: "Delegated actions, workflows, and autonomous task execution." },
  { key: "multimodal", label: "Multimodal I/O", shortLabel: "Multimodal", category: "interface", summary: "Image, audio, video, or cross-modal interaction." },
  { key: "structured-output", label: "Structured output", shortLabel: "Schema", category: "interface", summary: "JSON, extraction, or schema-shaped outputs." },
  { key: "tooling", label: "Tool use and integrations", shortLabel: "Tools", category: "orchestration", summary: "Connected tools, integrations, or external actions." },
  { key: "human-review", label: "Human review", shortLabel: "Review", category: "safety", summary: "People approve, edit, or collaborate with the system." },
  { key: "evals", label: "Evaluation disclosure", shortLabel: "Evals", category: "safety", summary: "Benchmarking, guardrails, or explicit quality posture." },
  { key: "api-first", label: "API-first surface", shortLabel: "API", category: "distribution", summary: "APIs, SDKs, webhooks, and developer docs are visible." },
  { key: "automation", label: "Workflow automation", shortLabel: "Automation", category: "orchestration", summary: "Repeated business processes are automated end to end." },
  { key: "analytics", label: "Analytics and observability", shortLabel: "Analytics", category: "measurement", summary: "Dashboards, reporting, and monitoring surfaces are visible." },
]

export async function getDashboardResearchCorpus() {
  const result = await db
    .select(dashboardProjectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(and(eq(projects.status, PROJECT_STATUS.published), isNotNull(projects.screenshotUrl)))
    .orderBy(desc(projects.credibilityScore), desc(projects.publishedAt), desc(projects.createdAt))

  const projectsWithGenome = result.map((entry) => {
    const project = normalizeProject(entry)
    const capabilities = inferCapabilityGenome(project)

    return {
      ...project,
      capabilityCount: capabilities.filter((capability) => capability.confidence >= 45).length,
      capabilities,
    }
  })

  const capabilityFrequency = CAPABILITY_DEFINITIONS.map((definition) => {
    const present = projectsWithGenome
      .map((project) => project.capabilities.find((capability) => capability.key === definition.key))
      .filter((capability): capability is CapabilityGenomeEntry => Boolean(capability))
      .filter((capability) => capability.confidence >= 45)

    const totalConfidence = present.reduce((sum, capability) => sum + capability.confidence, 0)

    return {
      ...definition,
      projectCount: present.length,
      averageConfidence: present.length > 0 ? Math.round(totalConfidence / present.length) : 0,
    }
  }).sort((left, right) => right.projectCount - left.projectCount || right.averageConfidence - left.averageConfidence)

  return {
    projects: projectsWithGenome,
    capabilityFrequency,
    useCaseBreakdown: groupCount(
      projectsWithGenome.map((project) => project.primaryUseCase ?? "Unlabeled"),
    ),
  }
}

export async function getCategoryTimeMachineData() {
  const months = buildRecentMonthBuckets(5)
  const oldestBoundary = months[0]?.start ?? startOfMonth(new Date())

  const [publishedProjects, snapshots, changeEvents] = await Promise.all([
    db
      .select({
        id: projects.id,
        primaryUseCase: projects.primaryUseCase,
        credibilityScore: projects.credibilityScore,
      })
      .from(projects)
      .where(eq(projects.status, PROJECT_STATUS.published)),
    db
      .select({
        projectId: projectSnapshots.projectId,
        capturedAt: projectSnapshots.capturedAt,
        pricingPageDetected: projectSnapshots.pricingPageDetected,
        docsDetected: projectSnapshots.docsDetected,
        demoCtaDetected: projectSnapshots.demoCtaDetected,
        primaryUseCase: projects.primaryUseCase,
      })
      .from(projectSnapshots)
      .innerJoin(projects, eq(projects.id, projectSnapshots.projectId))
      .where(
        and(
          eq(projects.status, PROJECT_STATUS.published),
          gte(projectSnapshots.capturedAt, oldestBoundary),
        ),
      ),
    db
      .select({
        detectedAt: projectChanges.detectedAt,
        primaryUseCase: projects.primaryUseCase,
      })
      .from(projectChanges)
      .innerJoin(projects, eq(projects.id, projectChanges.projectId))
      .where(
        and(
          eq(projects.status, PROJECT_STATUS.published),
          gte(projectChanges.detectedAt, oldestBoundary),
        ),
      ),
  ])

  const credibilityByCategory = publishedProjects.reduce<Record<string, number[]>>((accumulator, item) => {
    const key = item.primaryUseCase ?? "Unlabeled"
    accumulator[key] ??= []
    accumulator[key].push(item.credibilityScore)
    return accumulator
  }, {})

  const countByCategory = groupCount(
    publishedProjects.map((project) => project.primaryUseCase ?? "Unlabeled"),
  )
  const changeVelocityByCategory = groupCount(
    changeEvents
      .filter((item) => item.detectedAt >= subtractDays(new Date(), 30))
      .map((item) => item.primaryUseCase ?? "Unlabeled"),
  )

  const snapshotByCategoryAndMonth = snapshots.reduce<
    Record<string, Record<string, { docs: number; pricing: number; demo: number; count: number }>>
  >((accumulator, snapshot) => {
    const category = snapshot.primaryUseCase ?? "Unlabeled"
    const bucket = findMonthBucketLabel(months, snapshot.capturedAt)

    if (!bucket) {
      return accumulator
    }

    accumulator[category] ??= {}
    accumulator[category][bucket] ??= { docs: 0, pricing: 0, demo: 0, count: 0 }
    accumulator[category][bucket].count += 1
    accumulator[category][bucket].docs += snapshot.docsDetected ? 1 : 0
    accumulator[category][bucket].pricing += snapshot.pricingPageDetected ? 1 : 0
    accumulator[category][bucket].demo += snapshot.demoCtaDetected ? 1 : 0

    return accumulator
  }, {})

  return Object.keys({ ...countByCategory, ...snapshotByCategoryAndMonth })
    .map<TimeMachineCategory>((label) => {
      const timeline = months.map((bucket) => {
        const metrics = snapshotByCategoryAndMonth[label]?.[bucket.label]

        return {
          label: bucket.label,
          docsShare: metrics ? Math.round((metrics.docs / metrics.count) * 100) : 0,
          pricingShare: metrics ? Math.round((metrics.pricing / metrics.count) * 100) : 0,
          demoShare: metrics ? Math.round((metrics.demo / metrics.count) * 100) : 0,
          sampleSize: metrics?.count ?? 0,
        }
      })

      const latestPoint = timeline[timeline.length - 1] ?? {
        docsShare: 0,
        pricingShare: 0,
        demoShare: 0,
        sampleSize: 0,
        label: "",
      }
      const previousPoint = timeline[timeline.length - 2] ?? latestPoint
      const credibility = credibilityByCategory[label] ?? []

      return {
        label,
        projectCount: countByCategory[label] ?? 0,
        averageCredibility:
          credibility.length > 0
            ? Math.round(credibility.reduce((sum, value) => sum + value, 0) / credibility.length)
            : 0,
        changeVelocity: changeVelocityByCategory[label] ?? 0,
        latestDocsShare: latestPoint.docsShare,
        latestPricingShare: latestPoint.pricingShare,
        latestDemoShare: latestPoint.demoShare,
        docsDelta: latestPoint.docsShare - previousPoint.docsShare,
        pricingDelta: latestPoint.pricingShare - previousPoint.pricingShare,
        demoDelta: latestPoint.demoShare - previousPoint.demoShare,
        timeline,
      }
    })
    .sort(
      (left, right) =>
        right.projectCount - left.projectCount ||
        right.changeVelocity - left.changeVelocity ||
        left.label.localeCompare(right.label),
    )
}

export async function getProjectSystemDossier(projectId: string, actor: DossierActor) {
  const selectedProject = await db
    .select(dashboardProjectSelection)
    .from(projects)
    .innerJoin(user, eq(projects.createdByUserId, user.id))
    .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, actor.organizationId)))
    .limit(1)

  const projectRow = selectedProject[0]

  if (!projectRow) {
    return null
  }

  const project = normalizeProject(projectRow)
  const [forensics, peers, timeline, strategy, featureGaps, cohortRows] = await Promise.all([
    getProjectForensics(projectId),
    getProjectPeers(projectId),
    getProjectTimeline(projectId),
    getProjectStrategyTimeline(projectId),
    getProjectFeatureGaps(projectId),
    db
      .select(dashboardProjectSelection)
      .from(projects)
      .innerJoin(user, eq(projects.createdByUserId, user.id))
      .leftJoin(projectSignals, eq(projectSignals.projectId, projects.id))
      .where(
        and(
          eq(projects.status, PROJECT_STATUS.published),
          isNotNull(projects.screenshotUrl),
          project.primaryUseCase
            ? eq(projects.primaryUseCase, project.primaryUseCase)
            : eq(projects.status, PROJECT_STATUS.published),
        ),
      ),
  ])

  const capabilities = inferCapabilityGenome(
    project,
    forensics.evidence.map((item) => item.excerpt),
  )

  return {
    project: {
      ...project,
      canManage: canManageProject({
        role: actor.role,
        createdByUserId: project.createdByUserId,
        userId: actor.userId,
      }),
    },
    latestSnapshot: forensics.snapshot,
    pages: forensics.pages,
    evidence: forensics.evidence.slice(0, 10),
    peers,
    timeline,
    strategy,
    capabilities,
    capabilityCount: capabilities.filter((capability) => capability.confidence >= 45).length,
    architectureBlocks: buildArchitectureBlocks(capabilities),
    claimLedger: buildClaimLedger({
      project,
      latestSnapshot: forensics.snapshot,
      evidenceCount: forensics.evidence.length,
    }),
    benchmarkCards: buildBenchmarkCards(project, cohortRows.map(normalizeProject)),
    architectureGaps: buildArchitectureGapRead(project, capabilities, featureGaps),
    lineageHypotheses: peers.slice(0, 3).map((peer) => ({
      id: peer.id,
      name: peer.name,
      slug: peer.slug,
      similarityScore: peer.similarityScore,
      rationale: peer.rationale,
    })),
  }
}

function normalizeProject(project: DashboardProjectRow): NormalizedDashboardProject {
  return {
    ...project,
    pagesVisited: project.pagesVisited ?? 0,
    coverageScore: project.coverageScore ?? 0,
    marketClarityScore: project.marketClarityScore ?? 0,
    conversionScore: project.conversionScore ?? 0,
    trustScore: project.trustScore ?? 0,
    technicalDepthScore: project.technicalDepthScore ?? 0,
    proofScore: project.proofScore ?? 0,
    freshnessScore: project.freshnessScore ?? 0,
    pricingPageDetected: Boolean(project.pricingPageDetected),
    docsDetected: Boolean(project.docsDetected),
    demoCtaDetected: Boolean(project.demoCtaDetected),
    authWallDetected: Boolean(project.authWallDetected),
    enterpriseCueDetected: Boolean(project.enterpriseCueDetected),
    selfServeCueDetected: Boolean(project.selfServeCueDetected),
    proofPoints: project.proofPoints ?? [],
    evidenceSnippets: project.evidenceSnippets ?? [],
    confidenceScore: project.confidenceScore ?? 0,
  }
}

function inferCapabilityGenome(
  project: NormalizedDashboardProject,
  supplementalEvidence: string[] = [],
) {
  return CAPABILITY_DEFINITIONS.map((definition) => {
    const { confidence, evidence } = scoreCapability(project, definition.key, supplementalEvidence)

    return {
      ...definition,
      confidence,
      evidence,
      state:
        confidence >= 72
          ? "observed"
          : confidence >= 55
            ? "inferred"
            : confidence >= 38
              ? "emerging"
              : "absent",
    } satisfies CapabilityGenomeEntry
  })
}

function scoreCapability(
  project: NormalizedDashboardProject,
  key: string,
  supplementalEvidence: string[],
) {
  const evidence: string[] = []
  let confidence = 8
  const lower = buildProjectTextPool(project, supplementalEvidence)
  const pushEvidence = (message: string) => {
    if (!evidence.includes(message)) {
      evidence.push(message)
    }
  }
  const keywordScore = (keywords: string[], points: number, message: string) => {
    if (containsAny(lower, keywords)) {
      confidence += points
      pushEvidence(message)
    }
  }

  switch (key) {
    case "rag":
      if (project.primaryUseCase === "Knowledge assistant" || project.primaryUseCase === "Research assistant") {
        confidence += 24
        pushEvidence("Use case leans toward knowledge-grounded assistance.")
      }
      if (project.docsDetected) {
        confidence += 12
        pushEvidence("Public documentation is visible.")
      }
      keywordScore(["knowledge", "retrieval", "search", "docs", "documentation", "knowledge base", "semantic"], 28, "Copy and evidence mention retrieval or knowledge surfaces.")
      break
    case "agent":
      if (project.interactionModel === "Automation agent" || project.interactionModel === "Workflow") {
        confidence += 28
        pushEvidence("Interaction model signals delegated workflows or automation.")
      }
      keywordScore(["agent", "automation", "workflow", "delegate", "task", "orchestrate"], 28, "Evidence points to autonomous actions or delegated tasks.")
      break
    case "multimodal":
      keywordScore(["voice", "audio", "image", "video", "vision", "speech", "multimodal", "transcription"], 34, "Text or stack metadata signals multimodal input or output.")
      break
    case "structured-output":
      if (project.docsDetected) {
        confidence += 12
        pushEvidence("Docs often accompany structured programmatic outputs.")
      }
      keywordScore(["json", "schema", "structured", "extract", "extraction", "fields", "form"], 30, "Evidence mentions structured payloads or extraction-oriented outputs.")
      break
    case "tooling":
      keywordScore(["integration", "integrations", "slack", "zapier", "github", "notion", "hubspot", "connect"], 34, "Copy references integrations or connected tools.")
      break
    case "human-review":
      keywordScore(["review", "approve", "approval", "editor", "team", "collaborate", "workspace"], 30, "Evidence signals people stay in the loop before outputs are finalized.")
      break
    case "evals":
      keywordScore(["eval", "evaluation", "benchmark", "accuracy", "guardrail", "quality", "safety", "trace"], 34, "Evidence references benchmarking, quality, or guardrail posture.")
      break
    case "api-first":
      if (project.deploymentSurface === "API") {
        confidence += 26
        pushEvidence("Deployment surface is explicitly API-first.")
      }
      if (project.docsDetected || project.repositoryUrl) {
        confidence += 16
        pushEvidence("Docs or a repository provide developer-facing proof.")
      }
      keywordScore(["api", "sdk", "webhook", "endpoint", "developer", "reference"], 26, "Evidence references APIs, SDKs, or developer workflows.")
      break
    case "automation":
      if (project.primaryUseCase === "Workflow automation" || project.primaryUseCase === "AI employee") {
        confidence += 28
        pushEvidence("Use case is explicitly workflow automation or AI employee.")
      }
      if (project.interactionModel === "Workflow") {
        confidence += 18
        pushEvidence("Interaction model is workflow-driven.")
      }
      keywordScore(["workflow", "automation", "approvals", "handoff", "pipeline", "ops"], 24, "Copy references repeated process automation.")
      break
    case "analytics":
      keywordScore(["analytics", "insights", "reporting", "dashboard", "monitor", "metrics", "trace"], 34, "Evidence references reporting, dashboards, or monitoring surfaces.")
      break
    default:
      break
  }

  if (project.proofPoints.length > 0 && (key === "evals" || key === "human-review")) {
    confidence += 8
    pushEvidence("Proof points strengthen the reliability of this capability hypothesis.")
  }

  return {
    confidence: Math.min(100, confidence),
    evidence: evidence.slice(0, 3),
  }
}

function buildProjectTextPool(project: NormalizedDashboardProject, supplementalEvidence: string[]) {
  return [
    project.name,
    project.shortDescription,
    project.primaryUseCase,
    project.buyerType,
    project.interactionModel,
    project.pricingVisibility,
    project.deploymentSurface,
    project.modelVendorMix,
    project.credibilitySummary,
    project.researchSummary,
    project.likelyIcp,
    project.primaryHeadline,
    project.comparisonNote,
    project.aiTools.join(" "),
    project.tags.join(" "),
    project.evidenceSnippets.join(" "),
    supplementalEvidence.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function buildClaimLedger({
  project,
  latestSnapshot,
  evidenceCount,
}: {
  project: NormalizedDashboardProject
  latestSnapshot: Awaited<ReturnType<typeof getProjectForensics>>["snapshot"]
  evidenceCount: number
}) {
  const stale = !project.lastAnalyzedAt || project.lastAnalyzedAt < subtractDays(new Date(), 30)

  return [
    {
      label: "Documentation surface",
      detail: project.docsDetected ? "Public docs were detected." : "No public docs were detected.",
      provenance: "observed",
      reliability: project.docsDetected ? "high" : "medium",
      contradiction: null,
      freshness: stale ? "stale" : "fresh",
      snapshotDate: latestSnapshot?.capturedAt ?? null,
    },
    {
      label: "Pricing posture",
      detail: project.pricingPageDetected ? "A pricing surface was observed." : "Public pricing remains hidden or unclear.",
      provenance: "observed",
      reliability: project.pricingPageDetected ? "high" : "medium",
      contradiction:
        project.pricingVisibility === "Visible pricing" && !project.pricingPageDetected
          ? "Manual pricing metadata and observed pricing signals currently diverge."
          : null,
      freshness: stale ? "stale" : "fresh",
      snapshotDate: latestSnapshot?.capturedAt ?? null,
    },
    {
      label: "Likely ICP",
      detail: project.likelyIcp ? `The current evidence suggests ${project.likelyIcp}.` : "No strong ICP read yet.",
      provenance: "inferred",
      reliability: project.likelyIcp ? "medium" : "low",
      contradiction: null,
      freshness: stale ? "stale" : "fresh",
      snapshotDate: latestSnapshot?.capturedAt ?? null,
    },
    {
      label: "Commercial motion",
      detail:
        project.selfServeCueDetected && !project.demoCtaDetected
          ? "The launch surface currently leans self-serve."
          : project.demoCtaDetected || project.enterpriseCueDetected
            ? "The launch surface currently leans sales-assisted."
            : "The commercial motion is still ambiguous.",
      provenance: "observed",
      reliability:
        project.selfServeCueDetected || project.demoCtaDetected || project.enterpriseCueDetected
          ? "medium"
          : "low",
      contradiction: null,
      freshness: stale ? "stale" : "fresh",
      snapshotDate: latestSnapshot?.capturedAt ?? null,
    },
    {
      label: "Evidence density",
      detail:
        evidenceCount > 0
          ? `${evidenceCount} traceable evidence rows support the current read.`
          : "No traceable evidence rows were available for the latest read.",
      provenance: "observed",
      reliability: evidenceCount >= 8 ? "high" : evidenceCount >= 4 ? "medium" : "low",
      contradiction: null,
      freshness: stale ? "stale" : "fresh",
      snapshotDate: latestSnapshot?.capturedAt ?? null,
    },
  ]
}

function buildArchitectureBlocks(capabilities: CapabilityGenomeEntry[]) {
  const byKey = new Map(capabilities.map((capability) => [capability.key, capability]))

  return [
    buildArchitectureBlock("Knowledge layer", [byKey.get("rag")]),
    buildArchitectureBlock("Agent orchestration", [byKey.get("agent"), byKey.get("automation")]),
    buildArchitectureBlock("Developer and tool surface", [byKey.get("api-first"), byKey.get("tooling")]),
    buildArchitectureBlock("Safety and evaluation", [byKey.get("human-review"), byKey.get("evals")]),
    buildArchitectureBlock("Multimodal interface", [byKey.get("multimodal"), byKey.get("structured-output")]),
    buildArchitectureBlock("Measurement layer", [byKey.get("analytics")]),
  ]
}

function buildArchitectureBlock(label: string, capabilities: Array<CapabilityGenomeEntry | undefined>) {
  const present = capabilities.filter(Boolean) as CapabilityGenomeEntry[]
  const highestConfidence = present.reduce((max, capability) => Math.max(max, capability.confidence), 0)
  const evidence = buildArchitectureEvidence(present)

  return {
    label,
    status:
      highestConfidence >= 72
        ? "strong"
        : highestConfidence >= 48
          ? "emerging"
          : "unclear",
    confidence: highestConfidence,
    evidence,
    modules: present.map((capability) => capability.label),
  }
}

function buildBenchmarkCards(project: NormalizedDashboardProject, cohort: NormalizedDashboardProject[]) {
  const effectiveCohort = cohort.length > 1 ? cohort : [project]

  return [
    buildBenchmarkCard("Market clarity", project.marketClarityScore, effectiveCohort.map((item) => item.marketClarityScore)),
    buildBenchmarkCard("Technical depth", project.technicalDepthScore, effectiveCohort.map((item) => item.technicalDepthScore)),
    buildBenchmarkCard("Trust posture", project.trustScore, effectiveCohort.map((item) => item.trustScore)),
    buildBenchmarkCard("Freshness", project.freshnessScore, effectiveCohort.map((item) => item.freshnessScore)),
  ]
}

function buildBenchmarkCard(label: string, value: number, cohortValues: number[]) {
  const sorted = [...cohortValues].sort((left, right) => left - right)
  const rank = sorted.findIndex((entry) => entry >= value)
  const percentile =
    sorted.length <= 1
      ? 100
      : Math.round(((rank === -1 ? sorted.length - 1 : rank) / (sorted.length - 1)) * 100)
  const cohortAverage =
    sorted.length > 0
      ? Math.round(sorted.reduce((sum, entry) => sum + entry, 0) / sorted.length)
      : 0

  return {
    label,
    value,
    cohortAverage,
    percentile,
  }
}

function buildArchitectureGapRead(
  project: NormalizedDashboardProject,
  capabilities: CapabilityGenomeEntry[],
  featureGaps: Awaited<ReturnType<typeof getProjectFeatureGaps>>,
) {
  const byKey = new Map(capabilities.map((capability) => [capability.key, capability]))
  const architectureGaps = [
    project.primaryUseCase === "Research assistant" && (byKey.get("rag")?.confidence ?? 0) < 45
      ? {
          title: "Knowledge grounding is still unclear",
          reason: "Research-style products usually expose retrieval, knowledge, or source-trace patterns publicly.",
        }
      : null,
    (project.primaryUseCase === "Workflow automation" || project.primaryUseCase === "AI employee") &&
    (byKey.get("agent")?.confidence ?? 0) < 45
      ? {
          title: "Agent orchestration needs stronger public proof",
          reason: "Automation-heavy products benefit from showing task delegation, triggers, or workflow orchestration cues.",
        }
      : null,
    project.buyerType === "Developers" && (byKey.get("api-first")?.confidence ?? 0) < 45
      ? {
          title: "Developer surface is underspecified",
          reason: "Developer-facing products are easier to trust when APIs, SDKs, or docs are discoverable.",
        }
      : null,
    project.trustScore < 60 && (byKey.get("evals")?.confidence ?? 0) < 45
      ? {
          title: "Evaluation posture is missing",
          reason: "Current evidence does not strongly show guardrails, benchmarking, or quality-control surfaces.",
        }
      : null,
  ]
    .filter(
      (item): item is { title: string; reason: string } => Boolean(item),
    )
    .map((item) => ({
      title: item.title,
      reason: item.reason,
      source: "architecture",
    }))

  return [
    ...architectureGaps,
    ...featureGaps.slice(0, 3).map((gap) => ({
      title: gap.title,
      reason: gap.reason,
      source: "feature-gap",
    })),
  ].slice(0, 5)
}

function groupCount(values: string[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1
    return accumulator
  }, {})
}

function containsAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle))
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function subtractDays(value: Date, days: number) {
  return new Date(value.getTime() - days * 24 * 60 * 60 * 1000)
}

function buildRecentMonthBuckets(monthCount: number) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" })

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (monthCount - index - 1))

    return {
      start: startOfMonth(date),
      label: formatter.format(date),
    }
  })
}

function findMonthBucketLabel(
  buckets: Array<{ start: Date; label: string }>,
  value: Date,
) {
  const target = buckets.find(
    (bucket) =>
      bucket.start.getFullYear() === value.getFullYear() &&
      bucket.start.getMonth() === value.getMonth(),
  )

  return target?.label ?? null
}
