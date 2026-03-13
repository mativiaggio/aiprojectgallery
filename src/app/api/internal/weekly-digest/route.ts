import { NextResponse } from "next/server"

import { isAuthorizedCronRequest } from "@/lib/research/cron"
import { sendWeeklyResearchDigest } from "@/lib/research/service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const sent = await sendWeeklyResearchDigest()

  return NextResponse.json({ ok: true, sent })
}
