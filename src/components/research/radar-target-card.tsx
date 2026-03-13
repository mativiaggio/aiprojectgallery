import { ExternalLink } from "lucide-react"

import { formatDate } from "@/lib/i18n/format"
import { translateText } from "@/lib/i18n/dynamic-translation"
import { getI18n } from "@/lib/i18n/server"
import { ProjectImage } from "@/components/projects/project-image"
import { ClaimRadarTargetButton } from "@/components/research/claim-radar-target-button"
import { LinkButton } from "@/components/link-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type RadarTargetCardProps = {
  target: {
    id: string
    slug: string
    name: string
    appUrl: string
    screenshotUrl: string | null
    researchSummary: string | null
    primaryUseCase: string | null
    buyerType: string | null
    pricingVisibility: string | null
    credibilityScore: number
    needsClaim: boolean
    projectId: string | null
    lastChangedAt: Date | null
  }
  allowClaim?: boolean
}

export function RadarTargetCard({
  target,
  allowClaim = false,
}: RadarTargetCardProps) {
  return <RadarTargetCardContent target={target} allowClaim={allowClaim} />
}

async function RadarTargetCardContent({
  target,
  allowClaim,
}: RadarTargetCardProps) {
  const { locale, t } = await getI18n()
  const translatedSummary =
    await translateText({
      entityType: "radar-target",
      entityId: target.id,
      field: "researchSummary",
      locale,
      value: target.researchSummary,
    })

  return (
    <Card className="h-full py-0 shadow-none">
      {target.screenshotUrl ? (
        <ProjectImage
          src={target.screenshotUrl}
          alt={`${target.name} screenshot`}
          className="w-full border-b object-cover"
        />
      ) : (
        <div className="flex aspect-video items-end border-b bg-[linear-gradient(180deg,rgba(17,17,20,0),rgba(17,17,20,0.04))] p-4">
          <div className="rounded-md border border-border/70 bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
            {t("publicPages.radarCard.warmingUp")}
          </div>
        </div>
      )}
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap gap-2">
          {target.primaryUseCase ? <Badge variant="outline">{target.primaryUseCase}</Badge> : null}
          {target.buyerType ? <Badge variant="outline">{target.buyerType}</Badge> : null}
          {target.pricingVisibility ? (
            <Badge variant="outline">{target.pricingVisibility}</Badge>
          ) : null}
          {target.needsClaim ? <Badge variant="secondary">{t("publicPages.radarCard.needsClaim")}</Badge> : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg tracking-[-0.03em]">{target.name}</CardTitle>
          <Badge variant="outline">{t("publicPages.radarCard.credibility")} {target.credibilityScore}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="text-sm leading-7 text-muted-foreground">
          {translatedSummary ?? t("publicPages.radarCard.fallbackSummary")}
        </p>
        {target.lastChangedAt ? (
          <div className="text-sm text-muted-foreground">
            {t("publicPages.radarCard.lastStrategicChange")} {formatDate(target.lastChangedAt, locale)}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 border-t bg-muted/25">
        <LinkButton href="/radar" variant="outline" size="sm">
          {t("publicPages.radarCard.openRadar")}
        </LinkButton>
        <LinkButton href={target.appUrl} target="_blank" rel="noreferrer" size="sm" animated>
          {t("common.visitApp")}
          <ExternalLink data-icon="inline-end" />
        </LinkButton>
        {allowClaim && target.needsClaim ? <ClaimRadarTargetButton targetId={target.id} /> : null}
      </CardFooter>
    </Card>
  )
}
