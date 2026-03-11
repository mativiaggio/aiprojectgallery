import type { Metadata } from "next"

import { siteContent } from "@/content/site"
import { FaqList } from "@/components/marketing/faq-list"
import { LinkButton } from "@/components/link-button"
import { PricingCard } from "@/components/marketing/pricing-card"

export const metadata: Metadata = {
  title: "Pricing",
}

export default function PricingPage() {
  return (
    <div>
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              One plan. Free access. No pricing tiers to decode.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              The current offer covers submissions, listings, and updates without
              gating access to the catalog.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contact" size="lg" className="px-4">
                Talk to the team
              </LinkButton>
              <LinkButton href="/about" variant="outline" size="lg" className="px-4">
                Why this exists
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">The plan</h2>
            <p className="text-base leading-7 text-muted-foreground">
              The pricing model stays intentionally simple while the catalog is
              being built.
            </p>
          </div>
          <PricingCard tier={siteContent.pricingTier} />
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">What free includes</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Product submissions, public listings, and updates to the listing
                when information changes.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Why it stays simple</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A single plan removes friction for teams that want to submit a
                product or keep an existing listing current.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Who it is for</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Founders, product teams, investors, and researchers tracking live
                products built with AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Pricing FAQ</h2>
            <p className="text-base leading-7 text-muted-foreground">
              A short read on what is included today.
            </p>
          </div>
          <FaqList items={siteContent.faqs} />
        </div>
      </section>
    </div>
  )
}
