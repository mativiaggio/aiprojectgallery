export type Author = {
  name: string
  handle: string
  role: string
  initials: string
}

export type Project = {
  slug: string
  name: string
  tagline: string
  description: string
  url: string
  githubUrl?: string
  screenshotUrl: string
  framework: string
  tags: string[]
  tools: string[]
  createdAt: string
  stats: {
    saves: string
    comments: string
  }
  author: Author
}

export const projects: Project[] = [
  {
    slug: "signal-stack",
    name: "Signal Stack",
    tagline: "A product research workspace that turns prompts into sortable launch notes.",
    description:
      "Signal Stack helps small product teams collect user interviews, cluster findings, and publish weekly launch briefs. The build combines AI-assisted summaries with human curation so the final reports stay readable.",
    url: "https://signalstack.app",
    githubUrl: "https://github.com/example/signal-stack",
    screenshotUrl: "/projects/signal-stack.svg",
    framework: "Next.js",
    tags: ["Research", "SaaS", "Editorial UI"],
    tools: ["Codex", "ChatGPT", "Cursor"],
    createdAt: "March 10, 2026",
    stats: {
      saves: "184",
      comments: "32",
    },
    author: {
      name: "Matias Rojas",
      handle: "matias",
      role: "Indie maker",
      initials: "MR",
    },
  },
  {
    slug: "launch-brief",
    name: "Launch Brief",
    tagline: "A newsroom-style launch tracker for teams shipping multiple AI experiments.",
    description:
      "Launch Brief keeps every experiment in one place: goals, live links, before-and-after snapshots, and the exact AI stack used to get the work out the door.",
    url: "https://launchbrief.co",
    githubUrl: "https://github.com/example/launch-brief",
    screenshotUrl: "/projects/launch-brief.svg",
    framework: "Next.js",
    tags: ["Product Ops", "Launches", "Reports"],
    tools: ["Claude", "Codex", "Lovable"],
    createdAt: "March 8, 2026",
    stats: {
      saves: "126",
      comments: "18",
    },
    author: {
      name: "Matias Rojas",
      handle: "matias",
      role: "Indie maker",
      initials: "MR",
    },
  },
  {
    slug: "support-studio",
    name: "Support Studio",
    tagline: "A support portal built with AI that keeps help docs, tickets, and response drafts aligned.",
    description:
      "Support Studio combines a help center, ticket queue, and AI draft assistant so support teams can work faster without turning the UI into another bloated dashboard.",
    url: "https://supportstudio.app",
    githubUrl: "https://github.com/example/support-studio",
    screenshotUrl: "/projects/support-studio.svg",
    framework: "Next.js",
    tags: ["Support", "Knowledge Base", "B2B"],
    tools: ["Cursor", "ChatGPT", "Bolt"],
    createdAt: "March 6, 2026",
    stats: {
      saves: "94",
      comments: "14",
    },
    author: {
      name: "Nora Kim",
      handle: "nora",
      role: "Product designer",
      initials: "NK",
    },
  },
  {
    slug: "folio-forge",
    name: "Folio Forge",
    tagline: "A portfolio builder that helps agencies ship client showcases faster.",
    description:
      "Folio Forge is a lean publishing tool for studios that need reusable case-study layouts, better writing prompts, and a reliable editing workflow for launch week.",
    url: "https://folioforge.site",
    githubUrl: "https://github.com/example/folio-forge",
    screenshotUrl: "/projects/folio-forge.svg",
    framework: "Next.js",
    tags: ["Portfolio", "Agency", "Marketing"],
    tools: ["ChatGPT", "Cursor", "Claude"],
    createdAt: "March 2, 2026",
    stats: {
      saves: "76",
      comments: "11",
    },
    author: {
      name: "Elena Torres",
      handle: "elena",
      role: "Studio lead",
      initials: "ET",
    },
  },
]

export const featuredProjects = projects.slice(0, 3)

export const homepageStats = [
  { value: "128", label: "public launches already documented in the gallery" },
  { value: "17", label: "AI tools currently represented across submissions" },
  { value: "41", label: "makers building a visible history of shipped work" },
]

export const submissionSteps = [
  {
    title: "Share the essentials",
    description:
      "Add the project name, live URL, description, optional repository, AI tools used, and the tags that help people discover it.",
  },
  {
    title: "Generate the preview",
    description:
      "The platform captures a clean website screenshot so every launch looks consistent and easy to scan in the public gallery.",
  },
  {
    title: "Publish the project card",
    description:
      "Your launch appears in the gallery, gets its own detail page, and credits the maker behind the submission.",
  },
]

export const communityHighlights = [
  {
    title: "Clean launch records",
    description:
      "Each project page keeps the exact tool stack and links to the live build.",
    value: "Project cards, detail pages, and profiles all share one content model.",
  },
  {
    title: "Submission-first UX",
    description:
      "The submit page is already shaped around the final pipeline and validation rules.",
    value: "The front-end is ready for Better Auth, Prisma, and UploadThing wiring.",
  },
  {
    title: "Editorial structure",
    description:
      "The homepage behaves like a public catalog instead of a generic template landing page.",
    value: "Featured work, recent additions, FAQs, and maker profiles are all in place.",
  },
]

export const faqs = [
  {
    question: "What counts as an AI-built project?",
    answer:
      "Any public web product where AI tools meaningfully helped with coding, design, content, research, or shipping. The goal is to make the workflow visible, not to pretend the product was made with one prompt.",
  },
  {
    question: "Do I need to upload a screenshot myself?",
    answer:
      "No. The intended flow is to generate a clean screenshot from the live URL so every project card has a consistent preview without asking creators to prepare assets manually.",
  },
  {
    question: "Can I include the GitHub repository too?",
    answer:
      "Yes. Repositories are optional, but including one makes the launch more useful for other builders who want to study the technical decisions behind the product.",
  },
  {
    question: "Will every project have its own public page?",
    answer:
      "Yes. Each submission is meant to live in the gallery as its own page with the screenshot, short description, live app link, AI tools used, maker attribution, and optional GitHub repository.",
  },
]

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getProjectsByHandle(handle: string) {
  return projects.filter((project) => project.author.handle === handle)
}
