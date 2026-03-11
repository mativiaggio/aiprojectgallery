import Image from "next/image"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  GitBranch,
  Globe2,
  LayoutTemplate,
  Search,
  Sparkles,
  UserRoundPlus,
  WandSparkles,
} from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { ProjectCard } from "@/components/project-card"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { faqs, featuredProjects, homepageStats, projects, submissionSteps } from "@/lib/data"

const toolSignals = [
  {
    name: "ChatGPT",
    detail: "Ideation, copy, and implementation planning",
  },
  {
    name: "Codex",
    detail: "App scaffolds, refactors, and ship-ready fixes",
  },
  {
    name: "Cursor",
    detail: "Day-to-day building inside real product repos",
  },
  {
    name: "Claude",
    detail: "UX thinking, writing, and system-level edits",
  },
  {
    name: "Lovable",
    detail: "Fast interface exploration and landing concepts",
  },
  {
    name: "Bolt",
    detail: "Rapid experiments and working prototypes",
  },
]

const valueCards = [
  {
    icon: Search,
    title: "Browse real launches",
    description:
      "See the screenshot, live app, short pitch, and repo without digging through scattered product tweets.",
  },
  {
    icon: WandSparkles,
    title: "Track the AI stack",
    description:
      "Every submission makes the workflow visible, so you can see which tools were actually used to ship.",
  },
  {
    icon: LayoutTemplate,
    title: "Compare design patterns",
    description:
      "Jump between onboarding flows, dashboards, marketing pages, and public tools to study what works.",
  },
  {
    icon: UserRoundPlus,
    title: "Follow the maker",
    description:
      "Each launch credits its author, turning the gallery into a public track record instead of a pile of links.",
  },
]

const useCases = [
  {
    title: "For builders",
    description:
      "Submit your best work, build credibility over time, and give every launch a clean public page that is easy to share.",
    points: [
      "A public project card with screenshot and stack",
      "Optional GitHub repository for deeper technical context",
      "A profile page that grows with each new submission",
    ],
    href: "/submit",
    cta: "Submit your project",
  },
  {
    title: "For curious developers",
    description:
      "Use the gallery as a fast research layer when you want inspiration, benchmarks, or working examples of AI-assisted product work.",
    points: [
      "Discover real apps instead of vague concept demos",
      "Study how teams position and present their products",
      "Find repeat builders worth following",
    ],
    href: "/projects",
    cta: "Browse the gallery",
  },
]

const publishChecklist = [
  "Website screenshot preview",
  "Project name and one-line positioning",
  "Live URL and optional GitHub repository",
  "AI tools used during the build",
  "Author attribution and publication date",
]

export default function Home() {
  const heroProject = featuredProjects[0]

  return (
    <div>
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <Badge
                variant="outline"
                className="rounded-full border-border/80 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em]"
              >
                Community gallery for AI-built apps
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-balance text-foreground sm:text-5xl lg:text-6xl">
                Find the products people actually shipped with AI.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Browse web apps built with tools like ChatGPT, Codex, Cursor,
                Claude, Bolt, and Lovable. Explore the screenshots, study the
                stack, open the live product, and submit your own launch when it
                is ready.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/projects" size="lg" className="h-11 px-5">
                  Explore projects
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink
                  href="/submit"
                  variant="outline"
                  size="lg"
                  className="h-11 px-5"
                >
                  Submit your launch
                </ButtonLink>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                {homepageStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="font-mono text-xl text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-border/70 bg-card/92 shadow-[0_32px_80px_-56px_rgba(79,70,229,0.45)]">
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/20" />
                <p className="ml-2 text-sm text-muted-foreground">
                  aiprojectgallery.dev/explore
                </p>
              </div>
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                  <div className="overflow-hidden rounded-xl border border-border/70 bg-secondary/35">
                    <Image
                      src={heroProject.screenshotUrl}
                      alt={heroProject.name}
                      width={1200}
                      height={900}
                      className="h-auto w-full"
                      priority
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                      <p className="text-sm text-muted-foreground">
                        Featured today
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        {heroProject.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {heroProject.tagline}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Saves</p>
                        <p className="mt-2 font-mono text-xl">
                          {heroProject.stats.saves}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Comments</p>
                        <p className="mt-2 font-mono text-xl">
                          {heroProject.stats.comments}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-secondary/45 p-4">
                      <p className="text-sm text-muted-foreground">
                        Tools used
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {heroProject.tools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="outline"
                            className="rounded-md bg-background"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.slug}
                      className="rounded-xl border border-border/70 bg-background/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{project.name}</p>
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {project.framework}
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground">
                        {project.author.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/35">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                A gallery organized around the tools people really use.
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Instead of hiding the process, every launch makes the AI stack
                part of the story.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {toolSignals.map((tool) => (
              <Card
                key={tool.name}
                className="border-border/70 bg-background/80 py-0 shadow-none"
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {tool.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">
            Everything you need to decide whether a launch is worth opening.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            The homepage is designed to help people discover serious work fast:
            real screenshots, a quick product explanation, the live link, the
            repo if available, and the AI tools behind the build.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((item) => (
            <Card
              key={item.title}
              className="border-border/70 bg-card/88 shadow-none"
            >
              <CardHeader className="pb-2">
                <div className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                  <item.icon className="size-4 text-foreground" />
                </div>
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription className="leading-6">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="border-border/70 bg-card/88 shadow-none">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle>What gets published with each project</CardTitle>
              <CardDescription>
                A clean submission format keeps the gallery consistent and easy
                to scan on both desktop and mobile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {publishChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <p className="text-sm leading-6">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/88 shadow-none">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle>Project pages stay useful after the click</CardTitle>
              <CardDescription>
                The gallery card is only the first layer. Every launch opens
                into its own page with the full context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="overflow-hidden rounded-xl border border-border/70 bg-secondary/35">
                <Image
                  src={featuredProjects[1].screenshotUrl}
                  alt={featuredProjects[1].name}
                  width={1200}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-medium">{featuredProjects[1].name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {featuredProjects[1].description}
                  </p>
                </div>
                <AvatarGroup>
                  {projects.slice(0, 4).map((project) => (
                    <Avatar key={project.slug}>
                      <AvatarFallback>{project.author.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  <AvatarGroupCount>+24</AvatarGroupCount>
                </AvatarGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/35">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <Tabs defaultValue="featured" className="gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                  Recent launches from the gallery.
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  The public feed is the core of the product. Cards are compact,
                  visual, and easy to compare across categories and AI stacks.
                </p>
              </div>
              <TabsList variant="line" className="self-start">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="newest">Newest</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="featured">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="newest">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-border/80 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em]"
            >
              Submit once, publish everywhere
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              A submission flow built for real projects, not gallery fluff.
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              The product is designed so creators can share what they built
              without manually preparing a polished marketing pack. Add the
              essentials, let the platform generate the preview, and publish the
              launch with the right context around it.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/submit" size="lg" className="h-11 px-5">
                Start a submission
              </ButtonLink>
              <ButtonLink
                href="/projects"
                variant="outline"
                size="lg"
                className="h-11 px-5"
              >
                See published examples
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-4">
            {submissionSteps.map((step, index) => (
              <Card
                key={step.title}
                className="border-border/70 bg-card/88 py-0 shadow-none"
              >
                <CardContent className="flex gap-4 p-4 sm:p-5">
                  <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    0{index + 1}
                  </div>
                  <div>
                    <p className="text-base font-medium">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-border/70 bg-card/88 shadow-none">
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-base font-medium">
                    Every published launch keeps the useful links close.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Visitors can jump straight to the live site, open the GitHub
                    repo when it exists, and understand the AI-assisted workflow
                    without guessing.
                  </p>
                </div>
                <div className="flex gap-3 text-muted-foreground">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                    <Globe2 className="size-4" />
                  </div>
                  <div className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                    <GitBranch className="size-4" />
                  </div>
                  <div className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                    <Sparkles className="size-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/35">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            {useCases.map((item) => (
              <Card
                key={item.title}
                className="border-border/70 bg-card/88 shadow-none"
              >
                <CardHeader className="border-b border-border/70 pb-4">
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Check className="size-3.5" />
                      </span>
                      <p className="text-sm leading-6">{point}</p>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <ButtonLink href={item.href} variant="outline">
                    {item.cta}
                    <ArrowUpRight className="size-4" />
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="max-w-lg">
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              The landing should answer what the product is, who it helps, and
              what people can expect when they submit a project.
            </p>
          </div>

          <Card className="border-border/70 bg-card/88 shadow-none">
            <CardContent className="pt-4">
              <Accordion defaultValue={["item-0"]}>
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`item-${index}`}>
                    <AccordionTrigger className="text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10">
        <Card className="overflow-hidden border-border/70 bg-card/92 shadow-[0_32px_80px_-56px_rgba(79,70,229,0.45)]">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                Ship with AI. Publish with context.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Turn finished work into a discoverable public launch page, or
                use the gallery as a fast shortcut to see what other builders
                have already shipped with AI.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/submit" size="lg" className="h-11 px-5">
                Submit a project
              </ButtonLink>
              <ButtonLink
                href="/projects"
                variant="outline"
                size="lg"
                className="h-11 px-5"
              >
                Explore the gallery
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
