import type { Metadata } from "next"

import { AccountPageContent } from "@/components/account/account-page-content"

export const metadata: Metadata = {
  title: "Account",
}

export default async function DashboardAccountPage() {
  return <AccountPageContent />
}
