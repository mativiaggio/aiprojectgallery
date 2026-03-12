import { after, NextResponse } from "next/server"

import { createSubmissionForUser, processProjectScreenshot } from "@/lib/projects/service"
import type { SubmissionPayload } from "@/lib/projects/types"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sign in to submit a project.",
      },
      { status: 401 }
    )
  }

  const body = (await request.json()) as SubmissionPayload
  const result = await createSubmissionForUser(session.user.id, body)

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  after(async () => {
    await processProjectScreenshot(result.project.id)
  })

  return NextResponse.json(result, { status: 201 })
}
