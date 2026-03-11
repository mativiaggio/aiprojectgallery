import type { Metadata } from "next"

import { HomeLanding } from "@/components/marketing/home-landing"

export const metadata: Metadata = {
  title: "Home",
}

export default function HomePage() {
  return <HomeLanding />
}
