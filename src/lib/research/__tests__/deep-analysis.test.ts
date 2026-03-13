import test from "node:test"
import assert from "node:assert/strict"

import {
  classifyPageType,
  runDeepResearchAnalysis,
  shouldSkipCrawlUrl,
} from "../deep-analysis"

function mockResponse(url: string, body: string, contentType = "text/html; charset=utf-8") {
  return {
    url,
    status: 200,
    headers: new Headers({
      "content-type": contentType,
    }),
    text: async () => body,
  } as Response
}

const baseProject = {
  name: "SignalForge",
  shortDescription: "AI launch intelligence for modern software teams.",
  appUrl: "https://signalforge.test",
  aiTools: ["OpenAI", "Anthropic"],
  tags: ["research", "sales", "developer tools"],
  primaryUseCase: null,
  buyerType: null,
  interactionModel: null,
  pricingVisibility: null,
  deploymentSurface: null,
  modelVendorMix: null,
  repositoryUrl: "https://github.com/example/signalforge",
  verified: true,
  screenshotCapturedAt: new Date("2026-03-01T12:00:00.000Z"),
}

test("classifyPageType and skip rules prioritize research crawl targets", () => {
  assert.equal(classifyPageType("https://signalforge.test/pricing"), "pricing")
  assert.equal(classifyPageType("https://signalforge.test/docs/api"), "docs")
  assert.equal(classifyPageType("https://signalforge.test/security"), "trust")
  assert.equal(shouldSkipCrawlUrl("https://signalforge.test/dashboard"), true)
  assert.equal(shouldSkipCrawlUrl("https://signalforge.test/customers"), false)
})

test("runDeepResearchAnalysis crawls same-origin pages and produces deterministic scores", async () => {
  const responses = new Map<string, string>([
    [
      "https://signalforge.test",
      `
        <html>
          <head>
            <title>SignalForge | Revenue intelligence</title>
            <meta name="description" content="Revenue intelligence with docs, pricing, and trust signals." />
          </head>
          <body>
            <nav>
              <a href="/pricing">Pricing</a>
              <a href="/docs">Docs</a>
              <a href="/security">Security</a>
              <a href="https://github.com/example/signalforge">GitHub</a>
            </nav>
            <h1>Revenue intelligence for teams that need signal before every call</h1>
            <a href="/pricing">Start for free</a>
            <a href="/customers">Customer stories</a>
          </body>
        </html>
      `,
    ],
    [
      "https://signalforge.test/pricing",
      `
        <html>
          <body>
            <h1>Pricing</h1>
            <p>Plans start at $49 per seat each month with annual billing.</p>
            <button>Start for free</button>
          </body>
        </html>
      `,
    ],
    [
      "https://signalforge.test/docs",
      `
        <html>
          <body>
            <h1>Developer docs</h1>
            <p>API, SDK, and webhook reference for engineering teams.</p>
            <script type="application/ld+json">{"@type":"TechArticle"}</script>
          </body>
        </html>
      `,
    ],
    [
      "https://signalforge.test/security",
      `
        <html>
          <body>
            <h1>Security</h1>
            <p>SOC 2, GDPR, trust center, and DPA documentation.</p>
          </body>
        </html>
      `,
    ],
    [
      "https://signalforge.test/customers",
      `
        <html>
          <body>
            <h1>Customer stories</h1>
            <p>Trusted by revenue teams. Read the latest case study.</p>
          </body>
        </html>
      `,
    ],
  ])

  const fetcher: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const html = responses.get(url.replace(/\/$/, "")) ?? responses.get(url)

    assert.ok(html, `Unexpected fetch for ${url}`)

    return mockResponse(url, html)
  }

  const result = await runDeepResearchAnalysis({
    project: baseProject,
    screenshotUrl: "https://cdn.test/signalforge.png",
    githubSignal: {
      recentlyUpdated: true,
      signalText: "Repo updated recently",
    },
    fetcher,
  })

  assert.ok(result.pagesVisited >= 1)
  assert.ok(result.pricingPageDetected)
  assert.ok(result.docsDetected)
  assert.ok(result.trustScore >= 60)
  assert.ok(result.technicalDepthScore >= 60)
  assert.ok(result.evidence.some((item) => item.signalKey === "structured-data"))
  assert.ok(result.pages.every((page) => page.finalUrl.startsWith("https://signalforge.test")))
})

test("runDeepResearchAnalysis falls back to deterministic narratives without an OpenAI key", async () => {
  const fetcher: typeof fetch = async () =>
    mockResponse(
      "https://signalforge.test",
      `<html><body><h1>SignalForge</h1><a href="/pricing">Pricing</a><a href="/docs">Docs</a></body></html>`,
    )

  const result = await runDeepResearchAnalysis({
    project: baseProject,
    screenshotUrl: null,
    githubSignal: {
      recentlyUpdated: false,
      signalText: null,
    },
    fetcher,
  })

  assert.match(result.executiveAbstract, /SignalForge/)
  assert.match(result.forensicSummary, /same-origin evidence/i)
  assert.match(result.methodologyNote, /Methodology:/)
})

test("runDeepResearchAnalysis uses OpenAI output when the provider responds with valid JSON schema content", async () => {
  const fetcher: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url

    if (url === "https://api.openai.com/v1/chat/completions") {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  executiveAbstract: "LLM executive abstract",
                  forensicSummary: "LLM forensic summary",
                  methodologyNote: "LLM methodology note",
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      )
    }

    return mockResponse(
      "https://signalforge.test",
      `<html><body><h1>SignalForge</h1><a href="/pricing">Pricing</a></body></html>`
    )
  }

  const result = await runDeepResearchAnalysis({
    project: baseProject,
    screenshotUrl: null,
    githubSignal: {
      recentlyUpdated: false,
      signalText: null,
    },
    openAiApiKey: "test-key",
    fetcher,
  })

  assert.equal(result.executiveAbstract, "LLM executive abstract")
  assert.equal(result.forensicSummary, "LLM forensic summary")
  assert.equal(result.methodologyNote, "LLM methodology note")
})
