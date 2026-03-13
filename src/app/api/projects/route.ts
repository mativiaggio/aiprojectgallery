import { after, NextResponse } from "next/server"

import {
  createSubmissionForOrganization,
  processProjectScreenshot,
} from "@/lib/projects/service"
import { getProjectActor } from "@/lib/organizations/service"
import type { SubmissionPayload } from "@/lib/projects/types"
import { analyzeProjectResearch } from "@/lib/research/service"
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

  const actor = await getProjectActor()

  if (!actor) {
    return NextResponse.json(
      {
        ok: false,
        message: "Choose an active organization before creating a project.",
      },
      { status: 409 }
    )
  }

  const body = (await request.json()) as SubmissionPayload
  const result = await createSubmissionForOrganization(actor, body)

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  after(async () => {
    await analyzeProjectResearch(result.project.id).catch(() => null)
    await processProjectScreenshot(result.project.id)
  })

  return NextResponse.json(result, { status: 201 })
}
