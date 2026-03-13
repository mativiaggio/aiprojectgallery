import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"

export default async function SubmitPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/sign-in?callbackURL=%2Fdashboard%2Fsubmissions")
  }

  redirect("/dashboard/submissions")
}
