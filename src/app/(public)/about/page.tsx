import type { Metadata } from "next"

import { getSiteContent } from "@/content/site"
import { getI18n } from "@/lib/i18n/server"
import { LinkButton } from "@/components/link-button"

export const metadata: Metadata = {
  title: "About",
}

export default async function AboutPage() {
  const { locale } = await getI18n()
  const siteContent = getSiteContent(locale)

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {locale === "es"
                ? "Un directorio público de productos de IA con suficiente contexto para compararlos bien."
                : "A public directory for AI products with enough context to compare them properly."}
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              {siteContent.about.lead}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">
              {locale === "es" ? "Los principios" : "The principles"}
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              {locale === "es"
                ? "El objetivo es simple: que cada ficha sea legible, comparable y esté conectada a un producto real."
                : "The goal is simple: keep every listing readable, comparable, and tied to a real product."}
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {siteContent.about.principles.map((principle) => (
              <div key={principle.title} className="rounded-xl border bg-card p-5">
                <h3 className="text-lg font-semibold">{principle.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">
              {locale === "es" ? "Qué sigue" : "What happens next"}
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              {locale === "es"
                ? "La siguiente etapa es ampliar el catálogo con screenshots consistentes, datos de categoría y detalles de stack en más productos."
                : "The next stage is expanding the catalog with consistent screenshots, category data, and stack details across more products."}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <ol className="flex flex-col gap-4">
              {siteContent.about.roadmap.map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl border bg-panel p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {locale === "es" ? "Construido para research de producto recurrente." : "Built for repeat product research."}
                </h2>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {locale === "es"
                    ? "AI Project Gallery les da a founders, operators y equipos de producto una forma estructurada de revisar productos de IA en producción sin depender de posts breves o galerías de solo screenshots."
                    : "AI Project Gallery gives founders, operators, and product teams a structured way to review live AI products without relying on short launch posts or screenshot-only galleries."}
                </p>
              </div>
              <LinkButton href="/contact" size="lg" className="px-4">
                {locale === "es" ? "Contáctanos" : "Contact us"}
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
