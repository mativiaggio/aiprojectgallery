import { after, NextResponse } from "next/server"

import { processProjectScreenshot, retryProjectProcessing } from "@/lib/projects/service"
import { getProjectActor } from "@/lib/organizations/service"
import { analyzeProjectResearch } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sign in to manage your submissions.",
      },
      { status: 401 }
    )
  }

  const actor = await getProjectActor()

  if (!actor) {
    return NextResponse.json(
      {
        ok: false,
        message: "Choose an active organization before managing projects.",
      },
      { status: 409 }
    )
  }

  const { projectId } = await context.params
  const result = await retryProjectProcessing(projectId, actor)

  if ("error" in result) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.error === "forbidden"
            ? "You do not have permission to retry this project."
            : "Project not found.",
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    )
  }

  after(async () => {
    await analyzeProjectResearch(projectId).catch(() => null)
    await processProjectScreenshot(projectId)
  })

  return NextResponse.json({
    ok: true,
    project: result,
  })
}
