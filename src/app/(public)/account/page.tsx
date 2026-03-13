import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Account",
}

export default async function AccountPage() {
  redirect("/dashboard/account")
}
