import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { siteContent } from "@/content/site"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function HomeLanding() {
  const featured = siteContent.previewApps[0]
  const secondary = siteContent.previewApps.slice(1)

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
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
            <LinkButton href="/contact" size="lg">
              Submit your product
              <ArrowRightIcon data-icon="inline-end" />
            </LinkButton>
            <LinkButton href="/about" variant="outline" size="lg">
              Read how the gallery works
            </LinkButton>
          </div>
          <div className="grid gap-0 border sm:grid-cols-3">
            <InfoColumn
              title="Live products"
              description="Each listing points directly to a public production URL."
            />
            <InfoColumn
              title="Model stack"
              description="Visitors can compare which models power the product."
            />
            <InfoColumn
              title="Platform details"
              description="Frameworks, hosting, and tooling stay visible in one pass."
            />
          </div>
        </div>

        <div className="overflow-hidden border bg-card">
          <div className="grid border-b lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="border-b p-5 sm:p-6 lg:border-r lg:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-sm">
                  <div className="text-sm font-medium">Featured entry</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    A launch surface with enough technical context to be useful on
                    first read.
                  </p>
                </div>
                <Badge variant="outline">{featured.category}</Badge>
              </div>
              <div className="mt-6 border bg-panel p-5">
                <div className="text-2xl font-semibold tracking-[-0.05em]">
                  {featured.name}
                </div>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  {featured.tagline}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <DetailRow label="Production URL" value={featured.productionUrl} />
                  <DetailRow label="Models" value={featured.models.join(" + ")} />
                  <DetailRow label="Platforms" value={featured.platforms.join(" · ")} />
                  <DetailRow label="Capture style" value={featured.captureStyle} />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="text-sm font-medium">Why it stands out</div>
              <div className="mt-5 space-y-5">
                <MetricBlock
                  label="Category"
                  value={featured.category}
                  description="Positioning stays explicit instead of implied."
                />
                <MetricBlock
                  label="Curator note"
                  value={featured.curatorNote}
                  description="The listing explains what makes the product worth studying."
                />
                <MetricBlock
                  label="Review status"
                  value={featured.statusLabel}
                  description="Entries are edited into a consistent comparison format."
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium">Recently reviewed</div>
                <div className="text-sm text-muted-foreground">
                  {secondary.length} entries
                </div>
              </div>
              <div className="mt-4 border-t">
                {secondary.map((app, index) => (
                  <div key={app.name}>
                    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-6">
                      <div className="min-w-0">
                        <div className="text-base font-medium tracking-[-0.03em]">
                          {app.name}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {app.tagline}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground sm:text-right">
                        <div>{app.productionUrl}</div>
                        <div>{app.models.join(" + ")}</div>
                      </div>
                    </div>
                    {index < secondary.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-muted/25 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="text-sm font-medium">Index fields</div>
              <div className="mt-4 space-y-4">
                {siteContent.home.indexFields.slice(0, 4).map((field) => (
                  <div key={field.title} className="space-y-1">
                    <div className="text-sm font-medium">{field.title}</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {field.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              What every listing includes
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              The gallery is designed to help people judge a product quickly without
              losing the technical context that matters.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {siteContent.home.indexFields.map((field) => (
              <Card key={field.title} size="sm">
                <CardHeader>
                  <CardTitle>{field.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">
                    {field.description}
                  </p>
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
              Submissions stay simple. The listing format does the work of making
              products comparable.
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col">
              {siteContent.featureSteps.map((step, index) => (
                <div key={step.title}>
                  <div className="grid gap-3 py-4 sm:grid-cols-[2rem_1fr]">
                    <div className="text-sm text-muted-foreground">
                      0{index + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-medium tracking-[-0.03em]">
                        {step.title}
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {step.description}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {step.detail}
                      </p>
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
              Featured entries
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              A few examples of how products appear once the product summary, stack,
              and category data are assembled into one listing.
            </p>
          </div>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Start a submission
          </Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {siteContent.previewApps.map((app) => (
            <Card key={app.name}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl tracking-[-0.04em]">
                      {app.name}
                    </CardTitle>
                    <CardDescription className="leading-7">
                      {app.tagline}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{app.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-[0.9rem] border bg-muted/40 p-4">
                  <div className="text-sm font-medium">{app.productionUrl}</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {app.curatorNote}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.models.map((model) => (
                    <Badge key={model} variant="secondary">
                      {model}
                    </Badge>
                  ))}
                  {app.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-sm text-muted-foreground">{app.captureStyle}</span>
                <span className="text-sm font-medium">{app.statusLabel}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
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
            <LinkButton href="/contact" size="lg">
              Contact us
              <ArrowRightIcon data-icon="inline-end" />
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

type InfoColumnProps = {
  title: string
  description: string
}

function InfoColumn({ title, description }: InfoColumnProps) {
  return (
    <div className="border-b p-5 sm:border-r sm:border-b-0 sm:p-6 sm:last:border-r-0">
      <div className="text-base font-medium tracking-[-0.03em]">{title}</div>
      <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

type MetricBlockProps = {
  label: string
  value: string
  description: string
}

function MetricBlock({ label, value, description }: MetricBlockProps) {
  return (
    <div className="border-b pb-5 last:border-b-0 last:pb-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-medium tracking-[-0.03em]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

type DetailRowProps = {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="space-y-1 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium leading-6">{value}</div>
    </div>
  )
}
