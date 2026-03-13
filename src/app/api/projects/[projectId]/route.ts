import { after, NextResponse } from "next/server"

import {
  getProjectForWorkspace,
  processProjectScreenshot,
  updateProjectForOwner,
  deleteProjectForWorkspace,
} from "@/lib/projects/service"
import { getProjectActor } from "@/lib/organizations/service"
import type { ProjectUpdatePayload } from "@/lib/projects/types"
import { analyzeProjectResearch } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 }
    )
  }

  const actor = await getProjectActor()

  if (!actor) {
    return NextResponse.json(
      {
        ok: false,
        message: "Choose an active organization before opening projects.",
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

  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      status: project.status,
      screenshotUrl: project.screenshotUrl,
      processingError: project.processingError,
      verified: project.verified,
      canManage: project.canManage,
    },
  })
}

export async function PATCH(
  request: Request,
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
  const body = (await request.json()) as ProjectUpdatePayload
  const result = await updateProjectForOwner(projectId, actor, body)

  if ("error" in result) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.error === "forbidden"
            ? "You do not have permission to edit this project."
            : "Project not found.",
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    )
  }

  if ("ok" in result) {
    return NextResponse.json(result, { status: 400 })
  }

  if (result.appUrlChanged) {
    after(async () => {
      await analyzeProjectResearch(projectId).catch(() => null)
      await processProjectScreenshot(projectId)
    })
  }

  return NextResponse.json({
    ok: true,
    message: result.hostnameChanged
      ? "Project updated. Screenshot generation restarted and ownership verification was reset for the new hostname."
      : result.appUrlChanged
        ? "Project updated. Screenshot generation restarted for the new URL."
        : "Project updated.",
    appUrlChanged: result.appUrlChanged,
    hostnameChanged: result.hostnameChanged,
    project: result.project,
  })
}

export async function DELETE(
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
  const result = await deleteProjectForWorkspace(projectId, actor)

  if ("error" in result) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.error === "forbidden"
            ? "You do not have permission to delete this project."
            : "Project not found.",
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Project deleted.",
  })
}
