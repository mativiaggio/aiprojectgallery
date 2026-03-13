import type { Metadata } from "next"

import { CapabilityGenomeMatrix } from "@/components/dashboard/intelligence/capability-genome-matrix"
import { getDashboardResearchCorpus } from "@/lib/dashboard/intelligence"
import { requireDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Capability Genome",
}

export default async function DashboardGenomePage() {
  await requireDashboardContext("/dashboard/genome")
  const corpus = await getDashboardResearchCorpus()

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-[-0.05em]">Capability genome</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          An atomic capability map of the current AI product corpus. This view helps researchers
          compare products by system behavior, not just by market category.
        </p>
      </section>

      <CapabilityGenomeMatrix
        projects={corpus.projects}
        capabilityColumns={corpus.capabilityFrequency.slice(0, 10)}
      />
    </div>
  )
}
