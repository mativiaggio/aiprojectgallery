import { GlobeIcon, Layers2Icon, SparklesIcon } from "lucide-react"

import type { PreviewApp } from "@/content/site"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type HeroPreviewProps = {
  apps: PreviewApp[]
}

export function HeroPreview({ apps }: HeroPreviewProps) {
  const [featured, ...rest] = apps

  return (
    <div className="mx-auto w-full rounded-4xl border bg-card p-3">
      <div className="rounded-[1.6rem] border bg-background p-3">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">
              launch preview
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            mobile first
          </span>
        </div>
        <div className="rounded-xl border bg-panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-base font-semibold">{featured.name}</div>
              <p className="text-sm leading-6 text-muted-foreground">
                {featured.tagline}
              </p>
            </div>
            <Badge variant="outline">{featured.statusLabel}</Badge>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <GlobeIcon className="text-muted-foreground" />
              <span>{featured.productionUrl.replace("https://", "")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SparklesIcon className="text-muted-foreground" />
              <span>{featured.models.join(" + ")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Layers2Icon className="text-muted-foreground" />
              <span>{featured.platforms.join(" · ")}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-3">
          {rest.map((app) => (
            <div key={app.name} className="rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{app.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {app.category}
                  </div>
                </div>
                <Badge variant="outline">{app.statusLabel}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {app.captureStyle}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border bg-panel-strong p-3">
          <div className="font-mono text-[11px] text-muted-foreground">
            indexed fields
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">URL</Badge>
            <Badge variant="outline">Screenshot</Badge>
            <Badge variant="outline">Models</Badge>
            <Badge variant="outline">Platforms</Badge>
            <Badge variant="outline">Curator note</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
