import { NextResponse } from "next/server"

import { verifyProjectOwnership } from "@/lib/projects/service"
import { getProjectActor } from "@/lib/organizations/service"
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
  const result = await verifyProjectOwnership(projectId, actor)

  if ("error" in result) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.error === "forbidden"
            ? "You do not have permission to verify this project."
            : "Project not found.",
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    ownership: {
      verified: result.project.verified,
      verificationToken: result.project.verificationToken,
      verificationMetaTag: result.project.verificationMetaTag,
      verifiedAt: result.project.verifiedAt,
      verificationLastCheckedAt: result.project.verificationLastCheckedAt,
      verificationError: result.project.verificationError,
    },
  })
}
