import { NextResponse } from "next/server"

import {
  createResearchCollection,
  getCollectionsForProject,
  getCollectionsForUser,
} from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")
  const collections = projectId
    ? await getCollectionsForProject(session.user.id, projectId)
    : await getCollectionsForUser(session.user.id)

  return NextResponse.json({ ok: true, collections })
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    name?: string
    description?: string
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Name is required." },
      { status: 400 }
    )
  }

  const collectionId = await createResearchCollection({
    userId: session.user.id,
    name: body.name,
    description: body.description,
  })

  return NextResponse.json({ ok: true, collectionId }, { status: 201 })
}
