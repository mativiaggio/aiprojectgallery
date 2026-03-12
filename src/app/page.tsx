import type { Metadata } from "next"

import { HomeLanding } from "@/components/marketing/home-landing"
import { getPublishedProjects } from "@/lib/projects/service"

export const metadata: Metadata = {
  title: "Home",
}

export default async function HomePage() {
  const projects = await getPublishedProjects()

  return <HomeLanding projects={projects} />
}
