import { NextResponse } from "next/server"

import { isAuthorizedCronRequest } from "@/lib/research/cron"
import { syncDueProjectResearch, syncDueRadarResearch } from "@/lib/research/service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const [projectsProcessed, radarProcessed] = await Promise.all([
    syncDueProjectResearch(),
    syncDueRadarResearch(),
  ])

  return NextResponse.json({
    ok: true,
    processed: {
      projects: projectsProcessed,
      radar: radarProcessed,
    },
  })
}
