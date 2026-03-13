import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { AiToolsShowcase } from "@/components/marketing/ai-tools-showcase"
import { PublicProjectCard } from "@/components/projects/public-project-card"
import { LinkButton } from "@/components/link-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSiteContent } from "@/content/site"
import { getI18n } from "@/lib/i18n/server"

type HomeLandingProps = {
  projects: Array<{
    id: string
    slug: string
    name: string
    shortDescription: string
    appUrl: string
    screenshotUrl: string | null
    aiTools: string[]
    tags: string[]
    authorName: string
    verified: boolean
  }>
}

export async function HomeLanding({ projects }: HomeLandingProps) {
  const { locale } = await getI18n()
  const siteContent = getSiteContent(locale)
  const recentProjects = projects.slice(0, 6)

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <section className="mx-auto max-w-7xl flex flex-col">
        <div className="flex flex-col gap-8 lg:pr-6">
          <div className="flex flex-col gap-6 border-b pb-8">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-balance sm:text-6xl lg:text-[4.35rem] lg:leading-[0.98]">
              {siteContent.home.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {siteContent.home.heroDescription}
            </p>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {siteContent.home.heroNote}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/submit" size="lg" animated>
              Submit your product
              <ArrowRightIcon data-icon="inline-end" />
            </LinkButton>
            <LinkButton href="/research" variant="outline" size="lg">
              Open research
            </LinkButton>
            <LinkButton href="/about" variant="outline" size="lg">
              Read how the gallery works
            </LinkButton>
          </div>

          <div className="grid gap-0 border sm:grid-cols-3 rounded-2xl">
            <InfoColumn
              title="Live products"
              description="Only public launches with real URLs and usable screenshots make it into the catalog."
            />
            <InfoColumn
              title="AI stack"
              description="Each listing keeps the model and tooling layer close to the product story."
            />
            <InfoColumn
              title="Editorial shape"
              description="Screenshot-first cards make comparison easier than a launch feed or a raw table."
            />
          </div>
        </div>
      </section>

      <AiToolsShowcase projects={projects}/>

      <section className="mx-auto mt-24 grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              What every listing includes
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              The gallery is designed to help people judge a product quickly without losing the technical context that matters.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {siteContent.home.indexFields.map((field) => (
              <Card key={field.title} size="sm">
                <CardHeader>
                  <CardTitle>{field.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">{field.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              How submission works
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Submissions stay simple. The listing format does the work of making products comparable.
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col">
              {siteContent.featureSteps.map((step, index) => (
                <div key={step.title}>
                  <div className="grid gap-3 py-4 sm:grid-cols-[2rem_1fr]">
                    <div className="text-sm text-muted-foreground">0{index + 1}</div>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-medium tracking-[-0.03em]">{step.title}</div>
                      <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
                      <p className="text-sm leading-7 text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                  {index < siteContent.featureSteps.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Published projects
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Real submissions from the database, ordered by publication time and filtered so only complete listings make the public grid.
            </p>
          </div>
          <Link
            href="/submit"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Start a submission
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <PublicProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.3rem] border border-dashed bg-muted/15 px-6 py-10">
            <div className="text-lg font-medium tracking-[-0.03em]">No published projects yet</div>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              The first finished submission will appear here automatically once its screenshot is captured and stored.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto mt-24 max-w-7xl border-t pt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex flex-col gap-4">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              {siteContent.home.closingTitle}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {siteContent.home.closingDescription}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <LinkButton href="/submit" size="lg" animated animation="arrow">
              Submit your product
              <ArrowRightIcon data-icon="inline-end" />
            </LinkButton>
            <LinkButton href="/pulse" variant="outline" size="lg">
              Browse pulse
            </LinkButton>
            <LinkButton href="/pricing" variant="outline" size="lg">
              View pricing
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoColumn({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b p-5 sm:border-r sm:border-b-0 sm:p-6 sm:last:border-r-0">
      <div className="text-base font-medium tracking-[-0.03em]">{title}</div>
      <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  )
}
