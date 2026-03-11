import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { userProfiles } from "@/lib/db/schema"
import { getSession } from "@/lib/session"

export async function PATCH(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    headline?: string
    company?: string
    location?: string
    website?: string
    bio?: string
  }

  await db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      headline: body.headline?.trim() || null,
      company: body.company?.trim() || null,
      location: body.location?.trim() || null,
      website: body.website?.trim() || null,
      bio: body.bio?.trim() || null,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        headline: body.headline?.trim() || null,
        company: body.company?.trim() || null,
        location: body.location?.trim() || null,
        website: body.website?.trim() || null,
        bio: body.bio?.trim() || null,
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
    })

  return NextResponse.json({ message: "Profile updated." })
}
