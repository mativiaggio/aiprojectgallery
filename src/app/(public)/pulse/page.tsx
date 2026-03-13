import type { Metadata } from "next"

import { LinkButton } from "@/components/link-button"
import { PulseChangeList } from "@/components/research/pulse-change-list"
import { getI18n } from "@/lib/i18n/server"
import { getPulseFeed } from "@/lib/research/service"

export const metadata: Metadata = {
  title: "Pulse",
}

export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { t } = await getI18n()
  const params = await searchParams
  const changes = await getPulseFeed(40, params.type)
  const pulseFilters = [
    { label: t("publicPages.pulse.all"), value: "" },
    { label: t("publicPages.pulse.pricing"), value: "pricing-introduced" },
    { label: t("publicPages.pulse.docs"), value: "docs-launched" },
    { label: t("publicPages.pulse.enterpriseShift"), value: "enterprise-shift-detected" },
    { label: t("publicPages.pulse.positioning"), value: "positioning-rewritten" },
    { label: t("publicPages.pulse.onboarding"), value: "onboarding-path-changed" },
  ] as const

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.pulse.title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("publicPages.pulse.description")}
          </p>
        </section>
        <section className="flex flex-wrap gap-2">
          {pulseFilters.map((filter) => (
            <LinkButton
              key={filter.label}
              href={filter.value ? `/pulse?type=${filter.value}` : "/pulse"}
              variant={(params.type ?? "") === filter.value ? "default" : "outline"}
              size="sm"
            >
              {filter.label}
            </LinkButton>
          ))}
        </section>
        <PulseChangeList changes={changes} />
      </div>
    </div>
  )
}
