import type { PreviewApp } from "@/content/site"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PreviewAppCardProps = {
  app: PreviewApp
}

export function PreviewAppCard({ app }: PreviewAppCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{app.name}</CardTitle>
            <CardDescription>{app.tagline}</CardDescription>
          </div>
          <Badge variant="outline">{app.statusLabel}</Badge>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {app.productionUrl.replace("https://", "")}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{app.category}</Badge>
          {app.models.map((model) => (
            <Badge key={model} variant="outline">
              {model}
            </Badge>
          ))}
          {app.platforms.map((platform) => (
            <Badge key={platform} variant="outline">
              {platform}
            </Badge>
          ))}
        </div>
        <div className="rounded-lg border bg-panel p-3">
          <div className="font-mono text-[11px] text-muted-foreground">
            curator note
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {app.curatorNote}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">Featured listing</span>
        <span className="text-sm font-medium">Capture: {app.captureStyle}</span>
      </CardFooter>
    </Card>
  )
}
