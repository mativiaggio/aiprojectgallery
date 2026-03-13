import { NextResponse } from "next/server"

import { getProjectForWorkspace } from "@/lib/projects/service"
import { getProjectActor } from "@/lib/organizations/service"
import { runProjectAnalysisImmediately } from "@/lib/research/service"
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
  const project = await getProjectForWorkspace(projectId, actor)

  if (!project) {
    return NextResponse.json(
      {
        ok: false,
        message: "Project not found.",
      },
      { status: 404 }
    )
  }

  if (!project.canManage) {
    return NextResponse.json(
      {
        ok: false,
        message: "You do not have permission to run analysis for this project.",
      },
      { status: 403 }
    )
  }

  try {
    const outcome = await runProjectAnalysisImmediately(projectId)

    return NextResponse.json({
      ok: true,
      message: outcome.alreadyRunning
        ? "Analysis is already running."
        : "Analysis executed immediately.",
      run: outcome.run,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The analysis could not be executed right now.",
      },
      { status: 500 }
    )
  }
}
