export const PRIMARY_USE_CASE_OPTIONS = [
  "AI employee",
  "Agent builder",
  "Knowledge assistant",
  "Workflow automation",
  "Creative generation",
  "Developer tooling",
  "Customer support",
  "Sales intelligence",
  "Research assistant",
  "Data analysis",
  "Education",
  "Healthcare",
] as const

export const BUYER_TYPE_OPTIONS = [
  "Developers",
  "Founders",
  "Product teams",
  "Operations teams",
  "Marketing teams",
  "Sales teams",
  "Customer support teams",
  "Researchers",
  "Enterprises",
  "Consumers",
] as const

export const INTERACTION_MODEL_OPTIONS = [
  "Chat",
  "Copilot",
  "Workflow",
  "API",
  "Search",
  "Studio",
  "Automation agent",
] as const

export const PRICING_VISIBILITY_OPTIONS = [
  "Visible pricing",
  "Demo required",
  "Contact sales",
  "Free",
  "Unknown",
] as const

export const DEPLOYMENT_SURFACE_OPTIONS = [
  "Web app",
  "API",
  "Desktop",
  "Mobile",
  "Extension",
  "Slack",
  "Multi-surface",
] as const

export const MODEL_VENDOR_MIX_OPTIONS = [
  "OpenAI-first",
  "Anthropic-first",
  "Google-first",
  "Open model mix",
  "Multi-vendor",
  "Unspecified",
] as const

export const TAXONOMY_GROUPS = [
  "use-case",
  "buyer",
  "interaction",
  "market-signal",
] as const

export const PROJECT_VIEW_OPTIONS = [
  "overview",
  "forensics",
  "timeline",
  "strategy",
] as const

export const DEFAULT_MARKET_MAPS = [
  {
    slug: "ai-coding",
    title: "AI Coding",
    summary: "Developer tooling, API surfaces, and build-path products for software teams.",
    match: {
      primaryUseCase: ["Developer tooling"],
      buyerType: ["Developers"],
    },
  },
  {
    slug: "customer-support",
    title: "Customer Support",
    summary: "Products shaping support workflows, agent augmentation, and customer operations.",
    match: {
      primaryUseCase: ["Customer support"],
      buyerType: ["Customer support teams"],
    },
  },
  {
    slug: "research-assistants",
    title: "Research Assistants",
    summary: "AI products focused on discovery, synthesis, benchmarking, and analyst workflows.",
    match: {
      primaryUseCase: ["Research assistant", "Data analysis"],
      buyerType: ["Researchers"],
    },
  },
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    summary: "Operational AI products that automate repetitive business processes and team handoffs.",
    match: {
      primaryUseCase: ["Workflow automation", "AI employee"],
      buyerType: ["Operations teams", "Product teams"],
    },
  },
  {
    slug: "enterprise-watchlist",
    title: "Enterprise Watchlist",
    summary: "Products signaling enterprise posture, higher trust requirements, and sales-led motion.",
    match: {
      buyerType: ["Enterprises"],
      pricingVisibility: ["Contact sales", "Demo required"],
    },
  },
] as const

export const DEFAULT_TAXONOMY_TERMS = [
  { slug: "ai-employee", label: "AI employee", group: "use-case" },
  { slug: "agent-builder", label: "Agent builder", group: "use-case" },
  { slug: "knowledge-assistant", label: "Knowledge assistant", group: "use-case" },
  { slug: "workflow-automation", label: "Workflow automation", group: "use-case" },
  { slug: "creative-generation", label: "Creative generation", group: "use-case" },
  { slug: "developer-tooling", label: "Developer tooling", group: "use-case" },
  { slug: "customer-support", label: "Customer support", group: "use-case" },
  { slug: "sales-intelligence", label: "Sales intelligence", group: "use-case" },
  { slug: "research-assistant", label: "Research assistant", group: "use-case" },
  { slug: "developers", label: "Developers", group: "buyer" },
  { slug: "founders", label: "Founders", group: "buyer" },
  { slug: "product-teams", label: "Product teams", group: "buyer" },
  { slug: "operations-teams", label: "Operations teams", group: "buyer" },
  { slug: "marketing-teams", label: "Marketing teams", group: "buyer" },
  { slug: "sales-teams", label: "Sales teams", group: "buyer" },
  { slug: "customer-support-teams", label: "Customer support teams", group: "buyer" },
  { slug: "researchers", label: "Researchers", group: "buyer" },
  { slug: "enterprises", label: "Enterprises", group: "buyer" },
  { slug: "consumers", label: "Consumers", group: "buyer" },
  { slug: "chat", label: "Chat", group: "interaction" },
  { slug: "copilot", label: "Copilot", group: "interaction" },
  { slug: "workflow", label: "Workflow", group: "interaction" },
  { slug: "api", label: "API", group: "interaction" },
  { slug: "search", label: "Search", group: "interaction" },
  { slug: "studio", label: "Studio", group: "interaction" },
  { slug: "automation-agent", label: "Automation agent", group: "interaction" },
  { slug: "pricing-visible", label: "Pricing visible", group: "market-signal" },
  { slug: "docs-visible", label: "Docs visible", group: "market-signal" },
  { slug: "demo-cta", label: "Demo CTA", group: "market-signal" },
  { slug: "enterprise-cues", label: "Enterprise cues", group: "market-signal" },
  { slug: "self-serve", label: "Self-serve", group: "market-signal" },
] as const

export type PrimaryUseCase = (typeof PRIMARY_USE_CASE_OPTIONS)[number]
export type BuyerType = (typeof BUYER_TYPE_OPTIONS)[number]
export type InteractionModel = (typeof INTERACTION_MODEL_OPTIONS)[number]
export type PricingVisibility = (typeof PRICING_VISIBILITY_OPTIONS)[number]
export type DeploymentSurface = (typeof DEPLOYMENT_SURFACE_OPTIONS)[number]
export type ModelVendorMix = (typeof MODEL_VENDOR_MIX_OPTIONS)[number]
export type ProjectView = (typeof PROJECT_VIEW_OPTIONS)[number]
