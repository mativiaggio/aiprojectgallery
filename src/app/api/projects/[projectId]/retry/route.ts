import { after, NextResponse } from "next/server"

import { processProjectScreenshot, retryProjectProcessing } from "@/lib/projects/service"
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

  const { projectId } = await context.params
  const result = await retryProjectProcessing(projectId, session.user.id)

  if (!result) {
    return NextResponse.json(
      {
        ok: false,
        message: "Project not found.",
      },
      { status: 404 }
    )
  }

  after(async () => {
    await processProjectScreenshot(projectId)
  })

  return NextResponse.json({
    ok: true,
    project: result,
  })
}
