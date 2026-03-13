import type { Metadata } from "next"

import { CategoryTimeMachineBoard } from "@/components/dashboard/intelligence/category-time-machine-board"
import { getCategoryTimeMachineData } from "@/lib/dashboard/intelligence"
import { requireDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Time Machine",
}

export default async function DashboardTimeMachinePage() {
  await requireDashboardContext("/dashboard/time-machine")
  const categories = await getCategoryTimeMachineData()

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-[-0.05em]">Category time machine</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          A longitudinal read of how categories are changing across docs visibility, pricing
          transparency, and onboarding posture.
        </p>
      </section>

      <CategoryTimeMachineBoard categories={categories} />
    </div>
  )
}
