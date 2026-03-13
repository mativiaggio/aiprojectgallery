import { notFound } from "next/navigation"

import { CollectionActions } from "@/components/research/collection-actions"
import { DashboardCollectionItemCard } from "@/components/research/dashboard-collection-item-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCollectionDetail } from "@/lib/research/service"
import { env } from "@/lib/env"
import { requireSession } from "@/lib/session"

export default async function DashboardCollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>
}) {
  const session = await requireSession()
  const { collectionId } = await params
  const collection = await getCollectionDetail(collectionId, session.user.id)

  if (!collection) {
    notFound()
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{collection.name}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {collection.description || "Private research collection"}
          </p>
        </div>
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Collection actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            <CollectionActions
              collectionId={collection.id}
              isPublic={collection.isPublic}
              shareUrl={`${env.BETTER_AUTH_URL}/collections/${collection.shareToken}`}
            />
            {collection.briefGeneratedAt ? (
              <div className="text-sm text-muted-foreground">
                Brief generated {collection.briefGeneratedAt.toLocaleString()}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {collection.briefMarkdown ? (
        <section>
          <Card className="py-0 shadow-none">
            <CardHeader className="border-b py-5">
              <CardTitle>Latest brief</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7">
                {collection.briefMarkdown}
              </pre>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {collection.items.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {collection.items.map((item) => (
            <DashboardCollectionItemCard
              key={item.id}
              collectionId={collection.id}
              item={item}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-[1.2rem] border border-dashed bg-muted/15 px-6 py-10 text-sm leading-7 text-muted-foreground">
          This collection is empty. Add submissions from the dashboard, even if they are still processing, and they will appear here with status and analysis progress.
        </section>
      )}
    </div>
  )
}
