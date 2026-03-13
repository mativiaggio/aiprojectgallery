import { NextResponse } from "next/server"

import { updateCollectionSharing } from "@/lib/research/service"
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
  const body = (await request.json()) as { isPublic?: boolean }

  await updateCollectionSharing({
    collectionId,
    userId: session.user.id,
    isPublic: Boolean(body.isPublic),
  })

  return NextResponse.json({ ok: true })
}
