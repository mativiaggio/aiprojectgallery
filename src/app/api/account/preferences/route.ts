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
    productAnnouncements?: boolean
    securityAlerts?: boolean
    weeklyDigest?: boolean
  }

  await db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      productAnnouncements: Boolean(body.productAnnouncements),
      securityAlerts: Boolean(body.securityAlerts),
      weeklyDigest: Boolean(body.weeklyDigest),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        productAnnouncements: Boolean(body.productAnnouncements),
        securityAlerts: Boolean(body.securityAlerts),
        weeklyDigest: Boolean(body.weeklyDigest),
        updatedAt: new Date(),
      },
    })

  return NextResponse.json({ message: "Preferences updated." })
}
