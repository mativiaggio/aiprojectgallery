export type NavItem = {
  href: "/" | "/pricing" | "/about" | "/contact"
  label: string
}

export type FeatureStep = {
  title: string
  description: string
  detail: string
}

export type PreviewApp = {
  name: string
  tagline: string
  productionUrl: string
  category: string
  models: string[]
  platforms: string[]
  captureStyle: string
  statusLabel: string
  curatorNote: string
}

export type PricingTier = {
  name: string
  priceLabel: string
  cadence: string
  summary: string
  features: string[]
  cta: string
  footnote: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type ContactField = {
  id: string
  label: string
  type: "text" | "email" | "url" | "textarea"
  required?: boolean
}

export type ContactChannel = {
  title: string
  value: string
  href?: string
  description: string
}

export const siteContent = {
  brand: {
    name: "AI Project Gallery",
    summary: "Curated directory of live AI products.",
  },
  navItems: [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ] satisfies NavItem[],
  home: {
    heroTitle: "Discover polished AI products with the context behind how they were built.",
    heroDescription:
      "AI Project Gallery curates live AI-native products with the details people actually want to compare: what the product does, who it is for, which models power it, and the stack it runs on.",
    heroNote:
      "Each entry combines a public launch surface with useful technical context.",
    indexFields: [
      {
        title: "Production URL",
        description:
          "A direct path to the live product so every listing leads somewhere real.",
      },
      {
        title: "Landing capture",
        description:
          "A current screenshot of the public product so visitors can judge the product before clicking through.",
      },
      {
        title: "Models used",
        description:
          "The model stack behind text, image, voice, or multimodal features.",
      },
      {
        title: "Platforms",
        description:
          "Frameworks, hosting, orchestration, data tooling, and deployment context in one readable layer.",
      },
      {
        title: "Category tags",
        description:
          "Searchable metadata that helps visitors browse by use case, industry, and product type.",
      },
      {
        title: "Curator note",
        description:
          "A short note on category, positioning, and execution.",
      },
    ],
    closingTitle: "A calmer way to browse products built with AI.",
    closingDescription:
      "AI Project Gallery brings launch quality, product clarity, and stack transparency into one place so strong AI products are easier to find and easier to understand.",
  },
  featureSteps: [
    {
      title: "Submit your product",
      description:
        "Share the live URL, a short description, the category, and the current stack.",
      detail:
        "Listings are reserved for public products with enough detail to be useful on first read.",
    },
    {
      title: "Capture the launch surface",
      description:
        "Each listing includes the page or app view that people will actually see first.",
      detail:
        "That gives visitors immediate context before they open the production URL.",
    },
    {
      title: "Publish stack-aware profiles",
      description:
        "Models, platforms, categories, and notes are stored in one consistent format.",
      detail:
        "The result is easier to compare than a launch feed or a screenshot-only directory.",
    },
  ] satisfies FeatureStep[],
  previewApps: [
    {
      name: "Patchbay AI",
      tagline: "Turns policy docs into operating checklists for lean teams.",
      productionUrl: "patchbay.so",
      category: "Operations",
      models: ["GPT-4.1", "Claude 3.7 Sonnet"],
      platforms: ["Next.js", "Supabase", "Vercel"],
      captureStyle: "Task-first launch page",
      statusLabel: "Featured",
      curatorNote:
        "A strong operations product with a landing page that explains the value in one pass.",
    },
    {
      name: "Loomforge",
      tagline: "Builds internal copilots from team playbooks and meeting residue.",
      productionUrl: "loomforge.app",
      category: "Knowledge",
      models: ["Gemini 2.5 Pro", "o3-mini"],
      platforms: ["Remix", "Cloudflare", "LangChain"],
      captureStyle: "Minimal launch narrative",
      statusLabel: "Featured",
      curatorNote:
        "A clear example of why technical provenance matters as much as visual polish.",
    },
    {
      name: "Driftkit",
      tagline: "Generates motion briefs and campaign variants from brand inputs.",
      productionUrl: "driftkit.ai",
      category: "Creative tooling",
      models: ["Flux Pro", "GPT-4o"],
      platforms: ["Next.js", "Replicate", "PostHog"],
      captureStyle: "Editorial showcase layout",
      statusLabel: "Featured",
      curatorNote:
        "A creative product that benefits from being seen as both a launch and a stack story.",
    },
  ] satisfies PreviewApp[],
  pricingTier: {
    name: "Free access",
    priceLabel: "$0",
    cadence: "/month",
    summary:
      "One plan for submissions, public listings, and updates while the catalog is growing.",
    features: [
      "Submit live AI products",
      "Public listing with product summary, models, and platform details",
      "Direct link to the production URL",
      "Contact channel for updates, corrections, and questions",
      "Category organization across the catalog",
    ],
    cta: "Talk to us",
    footnote:
      "Free access keeps submissions simple while the catalog is being built.",
  } satisfies PricingTier,
  faqs: [
    {
      question: "Can creators submit apps today?",
      answer:
        "AI Project Gallery is built for creators shipping real products with a production URL, a clear category, and enough stack detail to make the listing genuinely useful.",
    },
    {
      question: "Will listings only include a screenshot?",
      answer:
        "No. Each listing combines a visual launch capture with product context, model details, platform information, tags, and a curator note.",
    },
    {
      question: "Is this a Product Hunt clone for AI apps?",
      answer:
        "No. The gallery focuses on durable listings with screenshots, product summaries, model details, platform context, and category data.",
    },
    {
      question: "What makes this useful for teams?",
      answer:
        "It helps teams study how strong AI products are presented, what stacks they use, and where they sit in the broader product landscape.",
    },
  ] satisfies FaqItem[],
  about: {
    lead:
      "AI Project Gallery exists because the best AI-built products deserve more than a fast-moving launch feed. They deserve a place where presentation, product clarity, and technical provenance live together.",
    principles: [
      {
        title: "Editorial, not noisy",
        description:
          "Entries are reviewed and formatted to make the product legible quickly.",
      },
      {
        title: "Structured, not vague",
        description:
          "Every listing makes the stack legible: models, frameworks, hosting, and platform context.",
      },
      {
        title: "Built for real launches",
        description:
          "The gallery is designed around public-facing products with a clear story, not hype without substance.",
      },
    ],
    roadmap: [
      "Submissions from teams shipping live AI products",
      "Consistent landing captures for every listing",
      "Rich stack-aware profiles that support comparison and discovery",
    ],
  },
  contact: {
    intro:
      "Share your launch, partnership idea, or product link and we will point you to the right conversation.",
    fields: [
      {
        id: "name",
        label: "Your name",
        type: "text",
        required: true,
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        id: "url",
        label: "Production URL",
        type: "url",
      },
      {
        id: "note",
        label: "Tell us about your product",
        type: "textarea",
      },
    ] satisfies ContactField[],
    channels: [
      {
        title: "Curator inbox",
        value: "hello@aiproject.gallery",
        href: "mailto:hello@aiproject.gallery",
        description: "For partnerships, product launches, and featured listing conversations.",
      },
      {
        title: "Editorial standard",
        value: "Strong products, clear stories",
        description: "We look for live products, clear positioning, and enough technical detail to make the listing useful.",
      },
      {
        title: "Response style",
        value: "Async and founder-friendly",
        description: "A concise note, a link, and a bit of context are enough to start the conversation.",
      },
    ] satisfies ContactChannel[],
  },
}
