import type { Metadata } from "next"

import { ResearchProjectCard } from "@/components/research/research-project-card"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getI18n } from "@/lib/i18n/server"
import { getSession } from "@/lib/session"
import { getResearchProjects } from "@/lib/research/service"
import {
  BUYER_TYPE_OPTIONS,
  DEPLOYMENT_SURFACE_OPTIONS,
  PRICING_VISIBILITY_OPTIONS,
  PRIMARY_USE_CASE_OPTIONS,
} from "@/lib/research/constants"

export const metadata: Metadata = {
  title: "Research",
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    useCase?: string
    buyer?: string
    pricing?: string
    surface?: string
    verified?: string
  }>
}) {
  const { t } = await getI18n()
  const params = await searchParams
  const session = await getSession()
  const projects = await getResearchProjects({
    query: params.q,
    primaryUseCase: params.useCase,
    buyerType: params.buyer,
    pricingVisibility: params.pricing,
    deploymentSurface: params.surface,
    verifiedOnly: params.verified === "1",
  })

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.research.title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("publicPages.research.description")}
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder={t("publicPages.research.searchPlaceholder")}
            />
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/research" variant="outline" size="sm">
                {t("common.reset")}
              </LinkButton>
              <button className="hidden" type="submit" />
            </div>
          </form>
          <div className="mt-4 space-y-3">
            <FilterRow label={t("publicPages.research.useCase")} queryKey="useCase" values={PRIMARY_USE_CASE_OPTIONS} active={params.useCase} />
            <FilterRow label={t("publicPages.research.buyer")} queryKey="buyer" values={BUYER_TYPE_OPTIONS} active={params.buyer} />
            <FilterRow label={t("publicPages.research.pricing")} queryKey="pricing" values={PRICING_VISIBILITY_OPTIONS} active={params.pricing} />
            <FilterRow
              label={t("publicPages.research.surface")}
              queryKey="surface"
              values={DEPLOYMENT_SURFACE_OPTIONS}
              active={params.surface}
            />
          </div>
        </section>

        <section className="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="outline">{projects.length} {t("publicPages.research.results")}</Badge>
          {params.verified === "1" ? <Badge variant="outline">{t("publicPages.research.verifiedOnly")}</Badge> : null}
        </section>

        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ResearchProjectCard
              key={project.id}
              project={project}
              allowSave={Boolean(session)}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

function FilterRow({
  label,
  queryKey,
  values,
  active,
}: {
  label: string
  queryKey: string
  values: readonly string[]
  active?: string
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <LinkButton
            key={value}
            href={`/research?${new URLSearchParams({ [queryKey]: value }).toString()}`}
            variant={active === value ? "default" : "outline"}
            size="sm"
          >
            {value}
          </LinkButton>
        ))}
      </div>
    </div>
  )
}
