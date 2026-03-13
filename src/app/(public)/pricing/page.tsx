import type { Metadata } from "next"

import { getSiteContent } from "@/content/site"
import { getI18n } from "@/lib/i18n/server"
import { FaqList } from "@/components/marketing/faq-list"
import { LinkButton } from "@/components/link-button"
import { PricingCard } from "@/components/marketing/pricing-card"

export const metadata: Metadata = {
  title: "Pricing",
}

export default async function PricingPage() {
  const { locale } = await getI18n()
  const siteContent = getSiteContent(locale)

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {locale === "es"
                ? "Un solo plan. Acceso gratis. Sin tiers para descifrar."
                : "One plan. Free access. No pricing tiers to decode."}
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              {locale === "es"
                ? "La oferta actual cubre envíos, fichas y actualizaciones sin bloquear el acceso al catálogo."
                : "The current offer covers submissions, listings, and updates without gating access to the catalog."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contact" size="lg" className="px-4">
                {locale === "es" ? "Hablar con el equipo" : "Talk to the team"}
              </LinkButton>
              <LinkButton href="/about" variant="outline" size="lg" className="px-4">
                {locale === "es" ? "Por qué existe" : "Why this exists"}
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">
              {locale === "es" ? "El plan" : "The plan"}
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              {locale === "es"
                ? "El modelo de precios se mantiene intencionalmente simple mientras el catálogo se sigue construyendo."
                : "The pricing model stays intentionally simple while the catalog is being built."}
            </p>
          </div>
          <PricingCard tier={siteContent.pricingTier} />
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{locale === "es" ? "Qué incluye gratis" : "What free includes"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {locale === "es"
                  ? "Envío de productos, fichas públicas y actualizaciones cuando cambia la información."
                  : "Product submissions, public listings, and updates to the listing when information changes."}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{locale === "es" ? "Por qué sigue simple" : "Why it stays simple"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {locale === "es"
                  ? "Un único plan reduce fricción para equipos que quieren enviar un producto o mantener una ficha actualizada."
                  : "A single plan removes friction for teams that want to submit a product or keep an existing listing current."}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{locale === "es" ? "Para quién es" : "Who it is for"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {locale === "es"
                  ? "Founders, equipos de producto, inversores e investigadores que siguen productos de IA en producción."
                  : "Founders, product teams, investors, and researchers tracking live products built with AI."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">{locale === "es" ? "FAQ de precios" : "Pricing FAQ"}</h2>
            <p className="text-base leading-7 text-muted-foreground">
              {locale === "es" ? "Una lectura corta sobre lo que hoy está incluido." : "A short read on what is included today."}
            </p>
          </div>
          <FaqList items={siteContent.faqs} />
        </div>
      </section>
    </div>
  )
}
