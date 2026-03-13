import type { Metadata } from "next"

import Link from "next/link"

import { CreateCollectionForm } from "@/components/research/create-collection-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCollectionsForUser } from "@/lib/research/service"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Collections",
}

export default async function DashboardCollectionsPage() {
  const session = await requireSession()
  const collections = await getCollectionsForUser(session.user.id)

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">Collections</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Save projects into private research sets, generate briefs, and share read-only links when you need them.
          </p>
        </div>
        <Card className="py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Create collection</CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <CreateCollectionForm />
          </CardContent>
        </Card>
      </section>

      {collections.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/dashboard/collections/${collection.id}`}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/20"
            >
              <div className="text-lg font-medium">{collection.name}</div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {collection.description || "No description yet."}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                {collection.itemCount} projects
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-[1.2rem] border border-dashed bg-muted/15 px-6 py-10 text-sm leading-7 text-muted-foreground">
          Create your first collection to start grouping submissions by market, workflow, or launch quality. Projects can be saved here even before their screenshots finish processing.
        </section>
      )}
    </div>
  )
}
