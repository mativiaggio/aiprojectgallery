import { after, NextResponse } from "next/server"

import { createRadarTarget, refreshRadarTarget } from "@/lib/research/service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sign in to add products to radar.",
      },
      { status: 401 }
    )
  }

  const body = (await request.json()) as { appUrl?: string }

  if (!body.appUrl?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        message: "A public URL is required.",
      },
      { status: 400 }
    )
  }

  try {
    const result = await createRadarTarget({
      userId: session.user.id,
      appUrl: body.appUrl,
    })

    after(async () => {
      await refreshRadarTarget(result.targetId).catch(() => null)
    })

    return NextResponse.json({
      ok: true,
      slug: result.slug,
      message: result.existed ? "This product is already tracked in radar." : "Product added to radar.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to add this product to radar.",
      },
      { status: 400 }
    )
  }
}
