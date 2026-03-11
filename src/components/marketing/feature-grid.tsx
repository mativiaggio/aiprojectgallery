import type { FeatureStep } from "@/content/site"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type FeatureGridProps = {
  steps: FeatureStep[]
}

export function FeatureGrid({ steps }: FeatureGridProps) {
  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <Card key={step.title}>
          <CardHeader>
            <div className="font-mono text-[11px] text-muted-foreground">
              0{index + 1}
            </div>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{step.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
