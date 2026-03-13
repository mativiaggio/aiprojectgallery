import { after, NextResponse } from "next/server"

import { getProjectActor } from "@/lib/organizations/service"
import { processProjectScreenshot } from "@/lib/projects/service"
import { claimRadarTarget, analyzeProjectResearch } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(
  _request: Request,
  context: { params: Promise<{ targetId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sign in to claim this product.",
      },
      { status: 401 }
    )
  }

  const actor = await getProjectActor()

  if (!actor) {
    return NextResponse.json(
      {
        ok: false,
        message: "Choose an active organization before claiming products.",
      },
      { status: 409 }
    )
  }

  const { targetId } = await context.params
  const result = await claimRadarTarget({
    targetId,
    userId: actor.userId,
    organizationId: actor.organizationId,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Radar target not found.",
      },
      { status: 404 }
    )
  }

  after(async () => {
    await analyzeProjectResearch(result.projectId).catch(() => null)

    if (!result.existed) {
      await processProjectScreenshot(result.projectId).catch(() => null)
    }
  })

  return NextResponse.json({
    ok: true,
    projectId: result.projectId,
    message: result.existed
      ? "This radar target is already linked to a project."
      : "Radar target claimed and upgraded into a managed project.",
  })
}
