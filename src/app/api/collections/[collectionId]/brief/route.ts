import { NextResponse } from "next/server"

import { generateCollectionBrief, getCollectionDetail } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  context: { params: Promise<{ collectionId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { collectionId } = await context.params
  const collection = await getCollectionDetail(collectionId, session.user.id)

  if (!collection) {
    return NextResponse.json({ ok: false, message: "Collection not found." }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format")

  if (format === "markdown") {
    return new NextResponse(collection.briefMarkdown ?? "", {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="${collection.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-brief.md"`,
      },
    })
  }

  return NextResponse.json({
    ok: true,
    briefMarkdown: collection.briefMarkdown,
    briefGeneratedAt: collection.briefGeneratedAt,
  })
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ collectionId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { collectionId } = await context.params
  const briefMarkdown = await generateCollectionBrief(collectionId, session.user.id)

  return briefMarkdown
    ? NextResponse.json({ ok: true, briefMarkdown })
    : NextResponse.json({ ok: false, message: "Collection not found." }, { status: 404 })
}
