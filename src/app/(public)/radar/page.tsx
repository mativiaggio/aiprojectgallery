import type { Metadata } from "next"

import { LinkButton } from "@/components/link-button"
import { RadarSubmitForm } from "@/components/research/radar-submit-form"
import { RadarTargetCard } from "@/components/research/radar-target-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getI18n } from "@/lib/i18n/server"
import { getRadarTargets } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Radar",
}

export default async function RadarPage() {
  const { t } = await getI18n()
  const session = await getSession()
  const radar = await getRadarTargets()

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-[-0.05em]">{t("publicPages.radar.title")}</h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {t("publicPages.radar.description")}
            </p>
          </div>
          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>{t("publicPages.radar.addTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              {session ? (
                <RadarSubmitForm />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("publicPages.radar.signInPrompt")}
                  </p>
                  <LinkButton href="/auth/sign-in" size="sm">
                    {t("common.signIn")}
                  </LinkButton>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <RadarLane
          title={t("publicPages.radar.recentlyDetected")}
          description={t("publicPages.radar.recentlyDetectedDescription")}
          emptyLabel={t("publicPages.radar.emptyLane")}
          targets={radar.recentlyDetected}
          allowClaim={Boolean(session)}
        />
        <RadarLane
          title={t("publicPages.radar.recentlyChanged")}
          description={t("publicPages.radar.recentlyChangedDescription")}
          emptyLabel={t("publicPages.radar.emptyLane")}
          targets={radar.recentlyChanged}
          allowClaim={Boolean(session)}
        />
        <RadarLane
          title={t("publicPages.radar.needsClaim")}
          description={t("publicPages.radar.needsClaimDescription")}
          emptyLabel={t("publicPages.radar.emptyLane")}
          targets={radar.needsClaim}
          allowClaim={Boolean(session)}
        />
      </div>
    </div>
  )
}

function RadarLane({
  title,
  description,
  emptyLabel,
  targets,
  allowClaim,
}: {
  title: string
  description: string
  emptyLabel: string
  targets: Awaited<ReturnType<typeof getRadarTargets>>["recentlyDetected"]
  allowClaim: boolean
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {targets.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {targets.map((target) => (
            <RadarTargetCard key={target.id} target={target} allowClaim={allowClaim} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.2rem] border border-dashed bg-muted/15 px-5 py-8 text-sm leading-6 text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </section>
  )
}
