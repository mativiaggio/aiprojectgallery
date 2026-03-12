import { NextResponse } from "next/server"

import { verifyProjectOwnership } from "@/lib/projects/service"
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
  const result = await verifyProjectOwnership(projectId, session.user.id)

  if (!result) {
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
