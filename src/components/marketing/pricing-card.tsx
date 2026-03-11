import { CheckIcon } from "lucide-react"

import type { PricingTier } from "@/content/site"
import { LinkButton } from "@/components/link-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PricingCardProps = {
  tier: PricingTier
}

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="gap-3">
        <div className="font-mono text-[11px] text-muted-foreground">
          current plan
        </div>
        <CardTitle>{tier.name}</CardTitle>
        <CardDescription>{tier.summary}</CardDescription>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-tight">{tier.priceLabel}</span>
          <span className="pb-1 text-sm text-muted-foreground">{tier.cadence}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-6">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <CheckIcon className="size-3.5" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{tier.footnote}</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/contact" size="sm" className="px-3">
            {tier.cta}
          </LinkButton>
          <LinkButton href="/about" variant="outline" size="sm" className="px-3">
            Why this exists
          </LinkButton>
        </div>
      </CardFooter>
    </Card>
  )
}
