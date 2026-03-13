import { NextResponse } from "next/server"

import {
  addProjectToCollection,
  removeProjectFromCollection,
} from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ collectionId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { collectionId } = await context.params
  const body = (await request.json()) as { projectId?: string; note?: string }

  if (!body.projectId) {
    return NextResponse.json(
      { ok: false, message: "projectId is required." },
      { status: 400 }
    )
  }

  const ok = await addProjectToCollection({
    collectionId,
    userId: session.user.id,
    projectId: body.projectId,
    note: body.note,
  })

  if (!ok.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          ok.error === "project-not-found"
            ? "Submission not found."
            : ok.error === "forbidden"
              ? "You do not have access to this collection."
              : "Collection not found.",
      },
      {
        status:
          ok.error === "project-not-found" || ok.error === "collection-not-found" ? 404 : 403,
      }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Submission added to collection.",
    added: ok.added,
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ collectionId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { collectionId } = await context.params
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json(
      { ok: false, message: "projectId is required." },
      { status: 400 }
    )
  }

  const ok = await removeProjectFromCollection({
    collectionId,
    userId: session.user.id,
    projectId,
  })

  if (!ok.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          ok.error === "forbidden"
            ? "You do not have access to this collection."
            : "Collection not found.",
      },
      { status: ok.error === "collection-not-found" ? 404 : 403 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Submission removed from collection.",
    removed: ok.removed,
  })
}
