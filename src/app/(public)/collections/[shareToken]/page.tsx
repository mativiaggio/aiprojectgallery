import { notFound } from "next/navigation"

import { ResearchProjectCard } from "@/components/research/research-project-card"
import { getSharedCollection } from "@/lib/research/service"

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = await params
  const collection = await getSharedCollection(shareToken)

  if (!collection) {
    notFound()
  }

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{collection.name}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {collection.description || "Shared research collection"}
          </p>
        </section>
        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {collection.items.map((item) => (
            <ResearchProjectCard key={item.id} project={item} />
          ))}
        </section>
      </div>
    </div>
  )
}
