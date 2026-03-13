import Link from "next/link"

import { formatDate } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"
import { translateFields } from "@/lib/i18n/dynamic-translation"
import { Badge } from "@/components/ui/badge"

export async function PulseChangeList({
  changes,
}: {
  changes: Array<{
    id: string
    changeType: string
    title: string
    detail: string
    impact: string
    detectedAt: Date
    projectSlug: string
    projectName: string
    credibilityScore: number
  }>
}) {
  const { locale, t } = await getI18n()
  const translatedChanges = await Promise.all(
    changes.map(async (change) => {
      const translated = await translateFields({
        entityType: "pulse-change",
        entityId: change.id,
        locale,
        fields: {
          title: change.title,
          detail: change.detail,
        },
      })

      return {
        ...change,
        title: translated.title ?? change.title,
        detail: translated.detail ?? change.detail,
      }
    })
  )

  return (
    <div className="divide-y rounded-lg border bg-card">
      {translatedChanges.map((change) => (
        <div key={change.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{change.impact}</Badge>
              <Link
                href={`/projects/${change.projectSlug}`}
                className="text-sm font-medium hover:underline"
              >
                {change.projectName}
              </Link>
            </div>
            <div className="text-base font-medium">{change.title}</div>
            <p className="text-sm leading-7 text-muted-foreground">{change.detail}</p>
          </div>
          <div className="text-sm text-muted-foreground md:text-right">
            <div>{formatDate(change.detectedAt, locale)}</div>
            <div>{t("publicPages.pulseList.credibility")} {change.credibilityScore}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
