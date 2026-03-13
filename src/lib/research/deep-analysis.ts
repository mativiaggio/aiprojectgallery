import { createHash } from "node:crypto"

import {
  extractHeadings,
  extractLinks,
  extractMetaContent,
  extractTitle,
  normalizeSet,
  stripHtml,
} from "@/lib/research/utils"

const MAX_CRAWL_PAGES = 8
const MAX_CRAWL_DEPTH = 2
const OPENAI_NARRATIVE_TIMEOUT_MS = 20_000
const OPENAI_NARRATIVE_PAGE_LIMIT = 4
const OPENAI_NARRATIVE_EVIDENCE_LIMIT = 12

const PAGE_TYPE_PRIORITY: Record<PageType, number> = {
  homepage: 0,
  pricing: 1,
  docs: 2,
  integrations: 3,
  customers: 4,
  trust: 5,
  updates: 6,
  auth: 7,
  legal: 8,
  general: 9,
}

const CTA_PATTERNS = [
  "book a demo",
  "request a demo",
  "watch demo",
  "get started",
  "start for free",
  "free trial",
  "join waitlist",
  "contact sales",
  "sign up",
  "try",
]

const PAGE_TYPE_PATTERNS: Array<{ type: PageType; patterns: string[] }> = [
  { type: "pricing", patterns: ["pricing", "plans", "billing"] },
  { type: "docs", patterns: ["docs", "documentation", "developer", "api", "sdk"] },
  { type: "integrations", patterns: ["integration", "integrations", "connect", "apps"] },
  { type: "customers", patterns: ["customers", "customer-stories", "case-studies", "testimonials"] },
  { type: "trust", patterns: ["security", "trust", "compliance", "privacy-center"] },
  { type: "updates", patterns: ["blog", "changelog", "release-notes", "news", "updates"] },
  { type: "auth", patterns: ["login", "log-in", "sign-in", "signup", "sign-up", "register", "waitlist"] },
  { type: "legal", patterns: ["privacy", "terms", "legal", "gdpr", "dpa"] },
]

const EXCLUDED_PATH_PATTERNS = [
  "/app",
  "/dashboard",
  "/workspace",
  "/admin",
  "/checkout",
  "/cart",
  "/logout",
  "/sign-out",
  "/account",
]

const MARKET_KEYWORDS = [
  "workflow",
  "automation",
  "assistant",
  "copilot",
  "platform",
  "research",
  "analysis",
  "sales",
  "support",
  "developer",
  "marketing",
  "legal",
]

const PRICING_KEYWORDS = ["pricing", "plans", "free trial", "start for free", "per seat", "$", "month"]
const DOCS_KEYWORDS = ["docs", "documentation", "api", "sdk", "webhook", "developer"]
const INTEGRATION_KEYWORDS = ["integration", "integrations", "slack", "zapier", "notion", "github", "hubspot"]
const TRUST_KEYWORDS = [
  "soc 2",
  "security",
  "compliance",
  "privacy",
  "gdpr",
  "iso 27001",
  "trust center",
  "terms",
  "dpa",
]
const PROOF_KEYWORDS = [
  "testimonial",
  "customer story",
  "case study",
  "trusted by",
  "used by",
  "logos",
  "customers",
]
const AUTH_KEYWORDS = ["sign in", "log in", "login", "request access", "join waitlist", "password"]
const FRESHNESS_KEYWORDS = [
  "changelog",
  "release notes",
  "last updated",
  "updated",
  "new in",
  "latest",
  "product updates",
]
const ENTERPRISE_KEYWORDS = ["enterprise", "compliance", "security", "contact sales", "procurement"]
const SELF_SERVE_KEYWORDS = ["start for free", "free trial", "get started", "self-serve", "sign up"]
const COLLABORATION_KEYWORDS = ["shared", "team", "workspace", "comment", "approval", "collaborate"]
const ANALYTICS_KEYWORDS = ["analytics", "insights", "reporting", "dashboard", "metrics"]
const COMPARE_KEYWORDS = ["compare", "benchmark", "versus", "vs."]

export type PageType =
  | "homepage"
  | "pricing"
  | "docs"
  | "integrations"
  | "customers"
  | "trust"
  | "updates"
  | "auth"
  | "legal"
  | "general"

export type AnalysisRunTrigger = "manual" | "scheduled" | "initial"

export type GithubSignal = {
  recentlyUpdated: boolean
  signalText: string | null
}

export type DeepAnalysisProject = {
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
  repositoryUrl: string | null
  verified: boolean
  screenshotCapturedAt: Date | null
}

export type CrawlPageRecord = {
  url: string
  pageType: PageType
  depth: number
  statusCode: number
  finalUrl: string
  title: string | null
  canonicalUrl: string | null
  metaDescription: string | null
  primaryHeadline: string | null
  headings: string[]
  ctaLabels: string[]
  navLabels: string[]
  structuredDataTypes: string[]
  outboundDomains: string[]
  hasForm: boolean
  authWallDetected: boolean
  htmlHash: string
  textHash: string
  textSnippet: string
}

export type EvidenceRecord = {
  category: EvidenceCategory
  signalKey: string
  label: string
  value: string
  excerpt: string
  sourceUrl: string
  confidence: number
}

type EvidenceCategory =
  | "market"
  | "conversion"
  | "trust"
  | "technical"
  | "proof"
  | "freshness"
  | "coverage"

type CrawlCandidate = {
  url: string
  depth: number
  pageType: PageType
}

type FetchedHtml = {
  url: string
  finalUrl: string
  html: string
  statusCode: number
  contentType: string | null
}

type PageExtraction = CrawlPageRecord & {
  text: string
  evidence: EvidenceRecord[]
  hasPricingCue: boolean
  hasDocsCue: boolean
  hasDemoCue: boolean
  hasEnterpriseCue: boolean
  hasSelfServeCue: boolean
  hasIntegrationCue: boolean
  hasCollaborationCue: boolean
  hasAnalyticsCue: boolean
  hasApiCue: boolean
  hasCompareCue: boolean
  hasProofCue: boolean
  recentYearMention: number | null
}

type NarrativeFields = {
  executiveAbstract: string
  forensicSummary: string
  methodologyNote: string
}

type NarrativeGenerationResult = NarrativeFields & {
  mode: "openai" | "fallback"
}

export type DeepAnalysisResult = NarrativeFields & {
  analysisMethod: string
  pagesAttempted: number
  pagesVisited: number
  coverageScore: number
  marketClarityScore: number
  conversionScore: number
  trustScore: number
  technicalDepthScore: number
  proofScore: number
  freshnessScore: number
  confidenceScore: number
  pageTitle: string | null
  primaryHeadline: string | null
  researchSummary: string
  comparisonNote: string
  likelyIcp: string | null
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
  htmlHash: string
  screenshotHash: string | null
  snapshotSummary: string
  taxonomyLabels: string[]
  inferredPrimaryUseCase: string | null
  inferredBuyerType: string | null
  inferredInteractionModel: string | null
  inferredPricingVisibility: string | null
  inferredDeploymentSurface: string | null
  inferredModelVendorMix: string | null
  pages: CrawlPageRecord[]
  evidence: EvidenceRecord[]
}

export async function runDeepResearchAnalysis({
  project,
  screenshotUrl,
  githubSignal,
  openAiApiKey,
  openAiModel,
  fetcher = fetch,
}: {
  project: DeepAnalysisProject
  screenshotUrl: string | null
  githubSignal: GithubSignal
  openAiApiKey?: string
  openAiModel?: string
  fetcher?: typeof fetch
}): Promise<DeepAnalysisResult> {
  const crawl = await crawlProjectWebsite(project.appUrl, fetcher)
  const draft = buildDeterministicReport({
    project,
    crawl,
    screenshotUrl,
    githubSignal,
  })

  const narratives = await generateNarratives({
    project,
    draft,
    apiKey: openAiApiKey,
    model: openAiModel,
    fetcher,
  })

  return {
    ...draft,
    executiveAbstract: narratives.executiveAbstract,
    forensicSummary: narratives.forensicSummary,
    methodologyNote: narratives.methodologyNote,
    analysisMethod: narratives.mode === "openai" ? "hybrid-openai" : "deterministic-fallback",
  }
}

export function buildDeterministicNarratives({
  project,
  draft,
}: {
  project: DeepAnalysisProject
  draft: Omit<DeepAnalysisResult, keyof NarrativeFields | "analysisMethod">
}): NarrativeFields {
  const strongest = rankScoreNarratives(draft).slice(0, 2)
  const weakest = rankScoreNarratives(draft, true).slice(0, 2)
  const pageTypes = normalizeSet(draft.pages.map((page) => page.pageType))
  const signalSummary =
    draft.evidenceSnippets.length > 0 ? draft.evidenceSnippets.slice(0, 3).join(" | ") : "Limited public signals."

  return {
    executiveAbstract: `${project.name} presents as ${
      draft.inferredPrimaryUseCase
        ? `a ${draft.inferredPrimaryUseCase.toLowerCase()} product`
        : "an AI product"
    } with ${draft.pagesVisited} analyzed page${draft.pagesVisited === 1 ? "" : "s"}, ${draft.coverageScore}% crawl coverage, and strongest evidence in ${strongest.join(" and ")}.`,
    forensicSummary: `The current public surface shows ${signalSummary}. The strongest dimensions are ${strongest.join(
      " and "
    )}, while the main gaps remain ${weakest.join(
      " and "
    )}. Pages observed: ${pageTypes.join(", ") || "homepage only"}. This report is grounded only in captured, same-origin evidence and recent GitHub freshness signals when available.`,
    methodologyNote: `Methodology: deterministic same-origin crawl of up to ${MAX_CRAWL_PAGES} pages at depth ${MAX_CRAWL_DEPTH}, prioritizing homepage, pricing, docs, integrations, customers, trust, updates, auth, and legal surfaces. Scores are computed from extracted headings, CTAs, metadata, structured data, trust/legal cues, technical surfaces, proof markers, freshness hints, and crawl coverage.`,
  }
}

export function classifyPageType(url: string): PageType {
  const lower = url.toLowerCase()

  for (const entry of PAGE_TYPE_PATTERNS) {
    if (entry.patterns.some((pattern) => lower.includes(pattern))) {
      return entry.type
    }
  }

  return "general"
}

export function shouldSkipCrawlUrl(url: string) {
  const lower = url.toLowerCase()

  return EXCLUDED_PATH_PATTERNS.some((pattern) => lower.includes(pattern))
}

async function crawlProjectWebsite(startUrl: string, fetcher: typeof fetch) {
  const root = new URL(startUrl)
  const normalizedRoot = normalizeUrl(root.href)
  const queue: CrawlCandidate[] = [
    {
      url: normalizedRoot,
      depth: 0,
      pageType: "homepage",
    },
  ]
  const discovered = new Set<string>([normalizedRoot])
  const pages: PageExtraction[] = []
  let pagesAttempted = 0

  while (queue.length > 0 && pages.length < MAX_CRAWL_PAGES) {
    queue.sort(compareCandidates)
    const candidate = queue.shift()

    if (!candidate) {
      break
    }

    pagesAttempted += 1

    try {
      const fetched = await fetchHtml(candidate.url, fetcher)

      if (!fetched.contentType?.includes("text/html")) {
        pages.push(buildFailedPage(candidate, fetched, "Non-HTML content"))
        continue
      }

      const extracted = extractPageSignals({
        fetched,
        pageType: candidate.pageType,
        depth: candidate.depth,
      })
      pages.push(extracted)

      if (candidate.depth >= MAX_CRAWL_DEPTH || extracted.authWallDetected) {
        continue
      }

      const nextLinks = discoverInternalLinks({
        root,
        currentUrl: fetched.finalUrl,
        html: fetched.html,
      })

      for (const link of nextLinks) {
        if (pages.length + queue.length >= MAX_CRAWL_PAGES) {
          break
        }

        if (discovered.has(link)) {
          continue
        }

        discovered.add(link)
        queue.push({
          url: link,
          depth: candidate.depth + 1,
          pageType: classifyPageType(link),
        })
      }
    } catch (error) {
      pages.push(
        buildFailedPage(
          candidate,
          {
            url: candidate.url,
            finalUrl: candidate.url,
            html: "",
            statusCode: 0,
            contentType: null,
          },
          error instanceof Error ? error.message : "Fetch failed"
        )
      )
    }
  }

  return {
    pagesAttempted,
    pages,
  }
}

function compareCandidates(left: CrawlCandidate, right: CrawlCandidate) {
  if (left.depth !== right.depth) {
    return left.depth - right.depth
  }

  const priorityDelta = PAGE_TYPE_PRIORITY[left.pageType] - PAGE_TYPE_PRIORITY[right.pageType]

  if (priorityDelta !== 0) {
    return priorityDelta
  }

  return left.url.localeCompare(right.url)
}

async function fetchHtml(url: string, fetcher: typeof fetch): Promise<FetchedHtml> {
  const response = await fetcher(url, {
    redirect: "follow",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12_000),
  })

  return {
    url,
    finalUrl: response.url,
    html: await response.text(),
    statusCode: response.status,
    contentType: response.headers.get("content-type"),
  }
}

function buildFailedPage(candidate: CrawlCandidate, fetched: FetchedHtml, reason: string): PageExtraction {
  return {
    url: candidate.url,
    pageType: candidate.pageType,
    depth: candidate.depth,
    statusCode: fetched.statusCode,
    finalUrl: fetched.finalUrl,
    title: reason,
    canonicalUrl: null,
    metaDescription: null,
    primaryHeadline: null,
    headings: [],
    ctaLabels: [],
    navLabels: [],
    structuredDataTypes: [],
    outboundDomains: [],
    hasForm: false,
    authWallDetected: false,
    htmlHash: hashValue(reason),
    textHash: hashValue(reason),
    textSnippet: reason,
    text: "",
    evidence: [
      {
        category: "coverage",
        signalKey: "crawl-failure",
        label: "Crawl issue",
        value: reason,
        excerpt: reason,
        sourceUrl: candidate.url,
        confidence: 0.52,
      },
    ],
    hasPricingCue: false,
    hasDocsCue: false,
    hasDemoCue: false,
    hasEnterpriseCue: false,
    hasSelfServeCue: false,
    hasIntegrationCue: false,
    hasCollaborationCue: false,
    hasAnalyticsCue: false,
    hasApiCue: false,
    hasCompareCue: false,
    hasProofCue: false,
    recentYearMention: null,
  }
}

function extractPageSignals({
  fetched,
  pageType,
  depth,
}: {
  fetched: FetchedHtml
  pageType: PageType
  depth: number
}): PageExtraction {
  const title = extractTitle(fetched.html)
  const metaDescription =
    extractMetaContent(fetched.html, "description") ??
    extractMetaContent(fetched.html, "og:description")
  const canonicalUrl =
    fetched.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() ??
    null
  const headings = extractHeadings(fetched.html).slice(0, 12)
  const primaryHeadline = headings[0] ?? title
  const links = extractLinks(fetched.html)
  const text = stripHtml(fetched.html)
  const lower = text.toLowerCase()
  const ctaLabels = normalizeSet(
    [
      ...links
        .map((link) => link.label)
        .filter((label) => CTA_PATTERNS.some((pattern) => label.toLowerCase().includes(pattern))),
      ...extractButtonLabels(fetched.html),
    ].filter((label) => label.length <= 80)
  ).slice(0, 12)
  const navLabels = extractNavLabels(fetched.html)
  const structuredDataTypes = extractStructuredDataTypes(fetched.html)
  const outboundDomains = extractOutboundDomains(links, fetched.finalUrl)
  const hasForm = /<form\b/i.test(fetched.html)
  const authWallDetected = containsAny(lower, AUTH_KEYWORDS) && ctaLabels.length <= 2
  const recentYearMention = extractRecentYear(text)

  const evidence: EvidenceRecord[] = []

  const hasPricingCue = addKeywordEvidence({
    bucket: evidence,
    category: "conversion",
    signalKey: "pricing-surface",
    label: "Pricing signal",
    keywords: PRICING_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasDocsCue = addKeywordEvidence({
    bucket: evidence,
    category: "technical",
    signalKey: "docs-surface",
    label: "Documentation signal",
    keywords: DOCS_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasIntegrationCue = addKeywordEvidence({
    bucket: evidence,
    category: "technical",
    signalKey: "integration-surface",
    label: "Integration signal",
    keywords: INTEGRATION_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasTrustCue = addKeywordEvidence({
    bucket: evidence,
    category: "trust",
    signalKey: "trust-surface",
    label: "Trust signal",
    keywords: TRUST_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasProofCue = addKeywordEvidence({
    bucket: evidence,
    category: "proof",
    signalKey: "proof-surface",
    label: "Proof signal",
    keywords: PROOF_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  addKeywordEvidence({
    bucket: evidence,
    category: "freshness",
    signalKey: "freshness-surface",
    label: "Freshness signal",
    keywords: FRESHNESS_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  addKeywordEvidence({
    bucket: evidence,
    category: "market",
    signalKey: "market-positioning",
    label: "Market positioning",
    keywords: MARKET_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text: `${primaryHeadline ?? ""} ${metaDescription ?? ""} ${headings.join(" ")}`,
  })
  const hasEnterpriseCue = addKeywordEvidence({
    bucket: evidence,
    category: "conversion",
    signalKey: "enterprise-cues",
    label: "Enterprise cue",
    keywords: ENTERPRISE_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasSelfServeCue = addKeywordEvidence({
    bucket: evidence,
    category: "conversion",
    signalKey: "self-serve-cues",
    label: "Self-serve cue",
    keywords: SELF_SERVE_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text: `${text} ${ctaLabels.join(" ")}`,
  })
  const hasCollaborationCue = addKeywordEvidence({
    bucket: evidence,
    category: "market",
    signalKey: "collaboration-cues",
    label: "Collaboration cue",
    keywords: COLLABORATION_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasAnalyticsCue = addKeywordEvidence({
    bucket: evidence,
    category: "market",
    signalKey: "analytics-cues",
    label: "Analytics cue",
    keywords: ANALYTICS_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasCompareCue = addKeywordEvidence({
    bucket: evidence,
    category: "market",
    signalKey: "compare-cues",
    label: "Comparison cue",
    keywords: COMPARE_KEYWORDS,
    sourceUrl: fetched.finalUrl,
    text,
  })
  const hasApiCue = hasDocsCue || containsAny(lower, ["api", "sdk", "webhook", "endpoint"])
  const hasDemoCue = containsAny(`${text} ${ctaLabels.join(" ")}`.toLowerCase(), [
    "book a demo",
    "request a demo",
    "watch demo",
    "contact sales",
  ])

  if (primaryHeadline) {
    evidence.push({
      category: "coverage",
      signalKey: "primary-headline",
      label: "Primary headline",
      value: primaryHeadline,
      excerpt: primaryHeadline,
      sourceUrl: fetched.finalUrl,
      confidence: 0.92,
    })
  }

  if (metaDescription) {
    evidence.push({
      category: "coverage",
      signalKey: "meta-description",
      label: "Meta description",
      value: metaDescription,
      excerpt: metaDescription,
      sourceUrl: fetched.finalUrl,
      confidence: 0.9,
    })
  }

  for (const ctaLabel of ctaLabels.slice(0, 4)) {
    evidence.push({
      category: "conversion",
      signalKey: "cta-label",
      label: "CTA label",
      value: ctaLabel,
      excerpt: ctaLabel,
      sourceUrl: fetched.finalUrl,
      confidence: 0.82,
    })
  }

  if (hasForm) {
    evidence.push({
      category: "conversion",
      signalKey: "form-detected",
      label: "Form detected",
      value: "true",
      excerpt: "A public-facing form was detected on this page.",
      sourceUrl: fetched.finalUrl,
      confidence: 0.78,
    })
  }

  for (const type of structuredDataTypes.slice(0, 4)) {
    evidence.push({
      category: "technical",
      signalKey: "structured-data",
      label: "Structured data",
      value: type,
      excerpt: `Structured data type detected: ${type}.`,
      sourceUrl: fetched.finalUrl,
      confidence: 0.74,
    })
  }

  for (const domain of outboundDomains.slice(0, 4)) {
    evidence.push({
      category: "technical",
      signalKey: "outbound-domain",
      label: "Outbound reference",
      value: domain,
      excerpt: `Outbound link detected to ${domain}.`,
      sourceUrl: fetched.finalUrl,
      confidence: 0.68,
    })
  }

  if (authWallDetected) {
    evidence.push({
      category: "conversion",
      signalKey: "auth-wall",
      label: "Auth wall cue",
      value: "true",
      excerpt: "This page appears gated or sign-in oriented.",
      sourceUrl: fetched.finalUrl,
      confidence: 0.8,
    })
  }

  if (recentYearMention) {
    evidence.push({
      category: "freshness",
      signalKey: "recent-year-mention",
      label: "Recent year mention",
      value: String(recentYearMention),
      excerpt: `The page references ${recentYearMention}, which helps infer freshness.`,
      sourceUrl: fetched.finalUrl,
      confidence: 0.66,
    })
  }

  if (pageType !== "general") {
    evidence.push({
      category: "coverage",
      signalKey: "page-type",
      label: "Page type",
      value: pageType,
      excerpt: `The crawler classified this page as ${pageType}.`,
      sourceUrl: fetched.finalUrl,
      confidence: 0.88,
    })
  }

  if (hasTrustCue && navLabels.some((label) => /security|privacy|trust/i.test(label))) {
    evidence.push({
      category: "trust",
      signalKey: "trust-navigation",
      label: "Trust navigation",
      value: navLabels.find((label) => /security|privacy|trust/i.test(label)) ?? "trust",
      excerpt: "Trust or security navigation is visible in the public site structure.",
      sourceUrl: fetched.finalUrl,
      confidence: 0.82,
    })
  }

  return {
    url: fetched.url,
    pageType,
    depth,
    statusCode: fetched.statusCode,
    finalUrl: fetched.finalUrl,
    title,
    canonicalUrl,
    metaDescription,
    primaryHeadline,
    headings,
    ctaLabels,
    navLabels,
    structuredDataTypes,
    outboundDomains,
    hasForm,
    authWallDetected,
    htmlHash: hashValue(fetched.html),
    textHash: hashValue(text),
    textSnippet: buildSnippet(primaryHeadline, metaDescription, text),
    text,
    evidence: dedupeEvidence(evidence),
    hasPricingCue,
    hasDocsCue,
    hasDemoCue,
    hasEnterpriseCue,
    hasSelfServeCue,
    hasIntegrationCue,
    hasCollaborationCue,
    hasAnalyticsCue,
    hasApiCue,
    hasCompareCue,
    hasProofCue,
    recentYearMention,
  }
}

function discoverInternalLinks({
  root,
  currentUrl,
  html,
}: {
  root: URL
  currentUrl: string
  html: string
}) {
  const base = new URL(currentUrl)
  const links = extractLinks(html)

  return normalizeSet(
    links
      .map((link) => {
        try {
          const nextUrl = new URL(link.href, base)

          if (nextUrl.origin !== root.origin) {
            return null
          }

          nextUrl.hash = ""

          const normalized = normalizeUrl(nextUrl.href)

          if (normalized === normalizeUrl(root.href)) {
            return null
          }

          if (shouldSkipCrawlUrl(normalized)) {
            return null
          }

          return normalized
        } catch {
          return null
        }
      })
      .filter(Boolean)
  )
}

function buildDeterministicReport({
  project,
  crawl,
  screenshotUrl,
  githubSignal,
}: {
  project: DeepAnalysisProject
  crawl: Awaited<ReturnType<typeof crawlProjectWebsite>>
  screenshotUrl: string | null
  githubSignal: GithubSignal
}): Omit<DeepAnalysisResult, keyof NarrativeFields | "analysisMethod"> {
  const pages = crawl.pages
  const successfulPages = pages.filter((page) => page.statusCode >= 200 && page.statusCode < 400)
  const evidence = dedupeEvidence(successfulPages.flatMap((page) => page.evidence))
  const combinedText = successfulPages.map((page) => page.text).join(" ").trim()
  const combinedLower = combinedText.toLowerCase()
  const homepage = successfulPages.find((page) => page.pageType === "homepage") ?? successfulPages[0] ?? null
  const uniquePageTypes = normalizeSet(successfulPages.map((page) => page.pageType))

  const coverageScore = clamp(
    Math.round(
      (successfulPages.length / Math.max(1, crawl.pagesAttempted)) * 45 +
        (uniquePageTypes.length / Object.keys(PAGE_TYPE_PRIORITY).length) * 55
    ),
    0,
    100
  )
  const marketClarityScore = clamp(
    24 +
      (homepage?.primaryHeadline ? 18 : 0) +
      (homepage?.metaDescription ? 12 : 0) +
      Math.min(28, countEvidence(evidence, "market") * 7) +
      (project.primaryUseCase ? 8 : 0),
    0,
    100
  )
  const conversionScore = clamp(
    18 +
      (pages.some((page) => page.hasPricingCue) ? 18 : 0) +
      (pages.some((page) => page.hasDemoCue) ? 12 : 0) +
      (pages.some((page) => page.hasSelfServeCue) ? 14 : 0) +
      (pages.some((page) => page.hasForm) ? 8 : 0) +
      Math.min(22, countEvidence(evidence, "conversion") * 5),
    0,
    100
  )
  const trustScore = clamp(
    16 +
      (project.verified ? 16 : 0) +
      (pages.some((page) => page.pageType === "trust") ? 12 : 0) +
      Math.min(28, countEvidence(evidence, "trust") * 6) +
      (pages.some((page) => page.hasProofCue) ? 8 : 0),
    0,
    100
  )
  const technicalDepthScore = clamp(
    14 +
      (pages.some((page) => page.hasDocsCue) ? 18 : 0) +
      (pages.some((page) => page.hasApiCue) ? 16 : 0) +
      (pages.some((page) => page.hasIntegrationCue) ? 14 : 0) +
      (project.repositoryUrl ? 10 : 0) +
      Math.min(24, countEvidence(evidence, "technical") * 5),
    0,
    100
  )
  const proofScore = clamp(
    12 +
      (pages.some((page) => page.hasProofCue) ? 20 : 0) +
      (pages.some((page) => page.pageType === "customers") ? 14 : 0) +
      Math.min(28, countEvidence(evidence, "proof") * 7),
    0,
    100
  )
  const freshnessScore = clamp(
    14 +
      (pages.some((page) => page.pageType === "updates") ? 16 : 0) +
      (pages.some((page) => page.recentYearMention && page.recentYearMention >= new Date().getFullYear() - 1)
        ? 18
        : 0) +
      (githubSignal.recentlyUpdated ? 18 : 0) +
      Math.min(20, countEvidence(evidence, "freshness") * 5),
    0,
    100
  )
  const evidenceDensity = clamp(successfulPages.length * 8 + evidence.length * 4, 0, 100)
  const weightedScore =
    marketClarityScore * 0.19 +
    conversionScore * 0.17 +
    trustScore * 0.18 +
    technicalDepthScore * 0.17 +
    proofScore * 0.14 +
    freshnessScore * 0.15
  const confidenceScore = clamp(
    Math.round(weightedScore * 0.58 + evidenceDensity * 0.22 + coverageScore * 0.2),
    0,
    100
  )

  const likelyIcp = inferIcp(combinedLower, project.tags)
  const inferredPrimaryUseCase = project.primaryUseCase ?? inferPrimaryUseCase(combinedLower, project.tags)
  const inferredBuyerType = project.buyerType ?? likelyIcp
  const inferredInteractionModel =
    project.interactionModel ?? inferInteractionModel(combinedLower, project.tags)
  const pricingPageDetected = pages.some((page) => page.hasPricingCue || page.pageType === "pricing")
  const docsDetected = pages.some((page) => page.hasDocsCue || page.pageType === "docs")
  const demoCtaDetected = pages.some((page) => page.hasDemoCue)
  const authWallDetected = pages.some((page) => page.authWallDetected)
  const enterpriseCueDetected = pages.some((page) => page.hasEnterpriseCue)
  const selfServeCueDetected = pages.some((page) => page.hasSelfServeCue)
  const integrationCueDetected = pages.some((page) => page.hasIntegrationCue)
  const collaborationCueDetected = pages.some((page) => page.hasCollaborationCue)
  const analyticsCueDetected = pages.some((page) => page.hasAnalyticsCue)
  const apiSurfaceDetected = pages.some((page) => page.hasApiCue)
  const compareSurfaceDetected = pages.some((page) => page.hasCompareCue)
  const inferredPricingVisibility = pricingPageDetected
    ? "Visible pricing"
    : demoCtaDetected || enterpriseCueDetected
      ? "Contact sales"
      : "Unknown"
  const inferredDeploymentSurface =
    project.deploymentSurface ?? inferDeploymentSurface(combinedLower, project.appUrl)
  const inferredModelVendorMix = project.modelVendorMix ?? inferModelVendorMix(project.aiTools)
  const proofPoints = normalizeSet([
    pages.some((page) => page.pageType === "customers") ? "Customer proof" : null,
    pages.some((page) => page.hasProofCue) ? "Testimonials or case studies" : null,
    pages.some((page) => page.pageType === "trust") || countEvidence(evidence, "trust") > 0
      ? "Trust or security posture"
      : null,
    githubSignal.signalText,
  ])
  const evidenceSnippets = normalizeSet(
    evidence
      .filter((item) => item.confidence >= 0.72)
      .map((item) => item.excerpt)
      .concat(successfulPages.map((page) => page.textSnippet))
      .filter(Boolean)
  ).slice(0, 8)

  const pageTitle = homepage?.title ?? null
  const primaryHeadline = homepage?.primaryHeadline ?? pageTitle ?? project.name
  const researchSummary = [
    `${project.name} reads like ${
      inferredPrimaryUseCase ? `a ${inferredPrimaryUseCase.toLowerCase()}` : "a live AI product"
    }`,
    inferredBuyerType ? `for ${inferredBuyerType.toLowerCase()}` : "for a mixed audience",
    pricingPageDetected ? "with visible pricing or plan structure" : "without explicit public pricing",
    docsDetected ? "and meaningful technical surface area." : "and a lighter public technical surface.",
  ].join(" ")

  const comparisonNote = buildComparisonNote({
    pricingPageDetected,
    docsDetected,
    demoCtaDetected,
    enterpriseCueDetected,
    selfServeCueDetected,
    proofPoints,
  })
  const snapshotSummary = `${primaryHeadline}. ${
    homepage?.metaDescription ?? project.shortDescription
  }`.slice(0, 280)
  const taxonomyLabels = normalizeSet([
    inferredPrimaryUseCase,
    inferredBuyerType,
    inferredInteractionModel,
    pricingPageDetected ? "Pricing visible" : null,
    docsDetected ? "Docs visible" : null,
    demoCtaDetected ? "Demo CTA" : null,
    enterpriseCueDetected ? "Enterprise cues" : null,
    selfServeCueDetected ? "Self-serve" : null,
    pages.some((page) => page.pageType === "trust") ? "Trust surface" : null,
    pages.some((page) => page.pageType === "updates") ? "Updates visible" : null,
  ])

  return {
    pagesAttempted: crawl.pagesAttempted,
    pagesVisited: successfulPages.length,
    coverageScore,
    marketClarityScore,
    conversionScore,
    trustScore,
    technicalDepthScore,
    proofScore,
    freshnessScore,
    confidenceScore,
    pageTitle,
    primaryHeadline,
    researchSummary,
    comparisonNote,
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
    htmlHash: hashValue(successfulPages.map((page) => page.textHash).join(":")),
    screenshotHash: screenshotUrl ? hashValue(screenshotUrl) : null,
    snapshotSummary,
    taxonomyLabels,
    inferredPrimaryUseCase,
    inferredBuyerType,
    inferredInteractionModel,
    inferredPricingVisibility,
    inferredDeploymentSurface,
    inferredModelVendorMix,
    pages: successfulPages.map((page) => ({
      url: page.url,
      pageType: page.pageType,
      depth: page.depth,
      statusCode: page.statusCode,
      finalUrl: page.finalUrl,
      title: page.title,
      canonicalUrl: page.canonicalUrl,
      metaDescription: page.metaDescription,
      primaryHeadline: page.primaryHeadline,
      headings: page.headings,
      ctaLabels: page.ctaLabels,
      navLabels: page.navLabels,
      structuredDataTypes: page.structuredDataTypes,
      outboundDomains: page.outboundDomains,
      hasForm: page.hasForm,
      authWallDetected: page.authWallDetected,
      htmlHash: page.htmlHash,
      textHash: page.textHash,
      textSnippet: page.textSnippet,
    })),
    evidence,
  }
}

async function generateNarratives({
  project,
  draft,
  apiKey,
  model,
  fetcher,
}: {
  project: DeepAnalysisProject
  draft: Omit<DeepAnalysisResult, keyof NarrativeFields | "analysisMethod">
  apiKey?: string
  model?: string
  fetcher: typeof fetch
}): Promise<NarrativeGenerationResult> {
  const fallback = buildNarrativeFallback({ project, draft })

  if (!apiKey) {
    return fallback
  }

  try {
    const response = await fetcher("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model ?? "gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a restrained research analyst. Summaries must be factual, evidence-grounded, and concise. Never invent facts beyond the provided evidence bundle.",
          },
          {
            role: "user",
            content: JSON.stringify({
              project: {
                name: project.name,
                appUrl: project.appUrl,
              },
              scores: {
                coverageScore: draft.coverageScore,
                marketClarityScore: draft.marketClarityScore,
                conversionScore: draft.conversionScore,
                trustScore: draft.trustScore,
                technicalDepthScore: draft.technicalDepthScore,
                proofScore: draft.proofScore,
                freshnessScore: draft.freshnessScore,
                confidenceScore: draft.confidenceScore,
              },
              pages: draft.pages.slice(0, OPENAI_NARRATIVE_PAGE_LIMIT).map((page) => ({
                pageType: page.pageType,
                url: page.finalUrl,
                title: page.title,
                primaryHeadline: page.primaryHeadline,
                ctaLabels: page.ctaLabels.slice(0, 3),
                textSnippet: page.textSnippet.slice(0, 220),
              })),
              evidence: draft.evidence.slice(0, OPENAI_NARRATIVE_EVIDENCE_LIMIT),
              proofPoints: draft.proofPoints,
              comparisonNote: draft.comparisonNote,
              methodology: `Same-origin crawl only. Up to ${MAX_CRAWL_PAGES} pages. No unsupported claims.`,
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "research_narrative",
            strict: true,
            schema: {
              type: "object",
              properties: {
                executiveAbstract: { type: "string" },
                forensicSummary: { type: "string" },
                methodologyNote: { type: "string" },
              },
              required: ["executiveAbstract", "forensicSummary", "methodologyNote"],
              additionalProperties: false,
            },
          },
        },
      }),
      signal: AbortSignal.timeout(OPENAI_NARRATIVE_TIMEOUT_MS),
    })

    if (!response.ok) {
      return fallback
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
    }
    const content = payload.choices?.[0]?.message?.content

    if (!content) {
      return fallback
    }

    const parsed = JSON.parse(content) as Partial<NarrativeFields>

    if (
      typeof parsed.executiveAbstract !== "string" ||
      typeof parsed.forensicSummary !== "string" ||
      typeof parsed.methodologyNote !== "string"
    ) {
      return fallback
    }

    return {
      executiveAbstract: parsed.executiveAbstract,
      forensicSummary: parsed.forensicSummary,
      methodologyNote: parsed.methodologyNote,
      mode: "openai",
    }
  } catch {
    return fallback
  }
}

function buildNarrativeFallback({
  project,
  draft,
}: {
  project: DeepAnalysisProject
  draft: Omit<DeepAnalysisResult, keyof NarrativeFields | "analysisMethod">
}): NarrativeGenerationResult {
  return {
    ...buildDeterministicNarratives({ project, draft }),
    mode: "fallback",
  }
}

function addKeywordEvidence({
  bucket,
  category,
  signalKey,
  label,
  keywords,
  sourceUrl,
  text,
}: {
  bucket: EvidenceRecord[]
  category: EvidenceCategory
  signalKey: string
  label: string
  keywords: string[]
  sourceUrl: string
  text: string
}) {
  const lower = text.toLowerCase()
  const matches = keywords.filter((keyword) => lower.includes(keyword))

  for (const match of matches.slice(0, 3)) {
    bucket.push({
      category,
      signalKey,
      label,
      value: match,
      excerpt: buildKeywordExcerpt(text, match),
      sourceUrl,
      confidence: 0.72,
    })
  }

  return matches.length > 0
}

function buildKeywordExcerpt(text: string, keyword: string) {
  const lower = text.toLowerCase()
  const index = lower.indexOf(keyword.toLowerCase())

  if (index === -1) {
    return keyword
  }

  return text.slice(Math.max(0, index - 40), Math.min(text.length, index + keyword.length + 100)).trim()
}

function extractButtonLabels(html: string) {
  return normalizeSet(
    [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)]
      .map((match) => stripHtml(match[1] ?? ""))
      .filter((label) => label.length > 1 && label.length <= 80)
  ).slice(0, 12)
}

function extractNavLabels(html: string) {
  const navSection = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? html

  return normalizeSet(
    [...navSection.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => stripHtml(match[1] ?? ""))
      .filter((label) => label.length > 1 && label.length <= 40)
  ).slice(0, 12)
}

function extractStructuredDataTypes(html: string) {
  const types: string[] = []

  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    const content = match[1]?.trim()

    if (!content) {
      continue
    }

    try {
      const parsed = JSON.parse(content)
      walkStructuredData(parsed, types)
    } catch {
      continue
    }
  }

  return normalizeSet(types).slice(0, 12)
}

function walkStructuredData(value: unknown, types: string[]) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkStructuredData(item, types)
    }
    return
  }

  if (!value || typeof value !== "object") {
    return
  }

  const record = value as Record<string, unknown>

  if (typeof record["@type"] === "string") {
    types.push(record["@type"])
  }

  for (const nested of Object.values(record)) {
    walkStructuredData(nested, types)
  }
}

function extractOutboundDomains(
  links: ReturnType<typeof extractLinks>,
  currentUrl: string
) {
  const currentOrigin = new URL(currentUrl).origin

  return normalizeSet(
    links
      .map((link) => {
        try {
          const url = new URL(link.href, currentUrl)

          if (url.origin === currentOrigin) {
            return null
          }

          return url.hostname.replace(/^www\./, "")
        } catch {
          return null
        }
      })
      .filter(Boolean)
  )
}

function buildSnippet(primaryHeadline: string | null, metaDescription: string | null, text: string) {
  if (primaryHeadline && metaDescription) {
    return `${primaryHeadline}. ${metaDescription}`.slice(0, 180)
  }

  if (primaryHeadline) {
    return primaryHeadline.slice(0, 180)
  }

  return text.slice(0, 180)
}

function countEvidence(evidence: EvidenceRecord[], category: EvidenceCategory) {
  return evidence.filter((item) => item.category === category).length
}

function dedupeEvidence(evidence: EvidenceRecord[]) {
  const seen = new Set<string>()

  return evidence.filter((item) => {
    const key = `${item.category}:${item.signalKey}:${item.value}:${item.sourceUrl}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function rankScoreNarratives(
  draft: Omit<DeepAnalysisResult, keyof NarrativeFields | "analysisMethod">,
  ascending = false
) {
  const ranked = [
    { label: "market clarity", value: draft.marketClarityScore },
    { label: "conversion clarity", value: draft.conversionScore },
    { label: "trust posture", value: draft.trustScore },
    { label: "technical depth", value: draft.technicalDepthScore },
    { label: "proof density", value: draft.proofScore },
    { label: "freshness", value: draft.freshnessScore },
  ].sort((left, right) => (ascending ? left.value - right.value : right.value - left.value))

  return ranked.map((item) => item.label)
}

function extractRecentYear(text: string) {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)]
    .map((match) => Number(match[1]))
    .filter((year) => year >= 2022 && year <= new Date().getFullYear() + 1)

  if (years.length === 0) {
    return null
  }

  return Math.max(...years)
}

function normalizeUrl(url: string) {
  const parsed = new URL(url)
  parsed.hash = ""

  if (
    (parsed.protocol === "https:" && parsed.port === "443") ||
    (parsed.protocol === "http:" && parsed.port === "80")
  ) {
    parsed.port = ""
  }

  return parsed.href.replace(/\/$/, "") || parsed.href
}

function containsAny(lower: string, keywords: string[]) {
  return keywords.some((keyword) => lower.includes(keyword))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function inferIcp(lower: string, tags: string[]) {
  const tagLower = tags.join(" ").toLowerCase()

  if (containsAny(`${lower} ${tagLower}`, ["developer", "engineering", "api"])) {
    return "Developers"
  }

  if (containsAny(`${lower} ${tagLower}`, ["support", "ticket", "customer"])) {
    return "Customer support teams"
  }

  if (containsAny(`${lower} ${tagLower}`, ["sales", "pipeline", "revenue"])) {
    return "Sales teams"
  }

  if (containsAny(`${lower} ${tagLower}`, ["marketing", "campaign", "growth"])) {
    return "Marketing teams"
  }

  if (containsAny(`${lower} ${tagLower}`, ["legal", "contract", "compliance"])) {
    return "Legal teams"
  }

  if (containsAny(`${lower} ${tagLower}`, ["ops", "workflow", "operations"])) {
    return "Operations teams"
  }

  return "Product teams"
}

function inferPrimaryUseCase(lower: string, tags: string[]) {
  const pool = `${lower} ${tags.join(" ").toLowerCase()}`

  if (containsAny(pool, ["support", "ticket", "customer service", "shared inbox"])) {
    return "Customer support"
  }

  if (containsAny(pool, ["research", "analysis", "benchmark", "compare"])) {
    return "Research assistant"
  }

  if (containsAny(pool, ["sales", "pipeline", "forecast", "revenue"])) {
    return "Sales intelligence"
  }

  if (containsAny(pool, ["workflow", "automation", "approval", "ops"])) {
    return "Workflow automation"
  }

  if (containsAny(pool, ["developer", "api", "sdk", "repo"])) {
    return "Developer tooling"
  }

  if (containsAny(pool, ["content", "copy", "marketing", "campaign"])) {
    return "Marketing"
  }

  return "Productivity"
}

function inferInteractionModel(lower: string, tags: string[]) {
  const pool = `${lower} ${tags.join(" ").toLowerCase()}`

  if (containsAny(pool, ["copilot", "assistant", "chat", "agent"])) {
    return "Copilot"
  }

  if (containsAny(pool, ["workflow", "automation", "pipeline"])) {
    return "Workflow"
  }

  if (containsAny(pool, ["dashboard", "analytics", "reporting"])) {
    return "Dashboard"
  }

  return "Web app"
}

function inferDeploymentSurface(lower: string, appUrl: string) {
  if (containsAny(lower, ["extension", "chrome", "browser"])) {
    return "Browser extension"
  }

  if (containsAny(lower, ["slack", "teams", "discord"])) {
    return "Embedded app"
  }

  if (containsAny(lower, ["mobile app", "ios", "android"])) {
    return "Mobile app"
  }

  return appUrl.includes(".") ? "Web app" : "Unknown"
}

function inferModelVendorMix(aiTools: string[]) {
  if (aiTools.length === 0) {
    return "Unknown"
  }

  if (aiTools.some((tool) => tool.toLowerCase().includes("openai")) && aiTools.length === 1) {
    return "Single vendor"
  }

  if (aiTools.length >= 2) {
    return "Multi-vendor"
  }

  return "Unknown"
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
  const motion = pricingPageDetected
    ? "leans toward transparent pricing"
    : selfServeCueDetected
      ? "leans toward a self-serve motion"
      : demoCtaDetected || enterpriseCueDetected
      ? "leans toward a sales-assisted motion"
      : "still hides its commercial motion"
  const technical = docsDetected ? "shows technical depth early" : "keeps technical proof relatively light"
  const proof = proofPoints.length > 0 ? `and surfaces ${proofPoints[0]!.toLowerCase()}` : "and still needs stronger public proof"

  return `Compared with other AI launches, the current surface ${motion}, ${technical}, ${proof}.`
}
