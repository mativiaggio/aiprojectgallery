import type { Metadata } from "next"
import {
  ArrowRight,
  Atom,
  Bookmark,
  FolderKanban,
  Orbit,
  Send,
  ShieldCheck,
  Telescope,
  Users2,
} from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireDashboardContext } from "@/lib/organizations/service"

export const metadata: Metadata = {
  title: "Dashboard",
}

const workspaceAreas = [
  {
    title: "Projects",
    description: "Review published listings, processing previews, and any submissions that need a retry.",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    title: "Submissions",
    description: "Launch the wizard, create a new listing immediately, and let the screenshot pipeline run in the background.",
    href: "/dashboard/submissions",
    icon: Send,
  },
  {
    title: "Account",
    description: "Profile, notifications, and security settings stay available in the workspace.",
    href: "/dashboard/account",
    icon: ShieldCheck,
  },
  {
    title: "Organization",
    description: "Members, invitations, and role changes for the active shared workspace.",
    href: "/dashboard/organization",
    icon: Users2,
  },
  {
    title: "Collections",
    description: "Save research sets, generate briefs, and keep private notes on market clusters.",
    href: "/dashboard/collections",
    icon: Bookmark,
  },
  {
    title: "Intelligence",
    description: "Open the private module hub for dossiers, capability patterns, and research workflows.",
    href: "/dashboard/intelligence",
    icon: Telescope,
  },
  {
    title: "Genome",
    description: "Compare the published AI product corpus by atomic capabilities and system behavior.",
    href: "/dashboard/genome",
    icon: Atom,
  },
  {
    title: "Time Machine",
    description: "Inspect how categories are shifting across docs, pricing, and onboarding posture.",
    href: "/dashboard/time-machine",
    icon: Orbit,
  },
]

export default async function DashboardPage() {
  const context = await requireDashboardContext("/dashboard")

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-xl py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>{context.activeOrganization.name}</CardTitle>
            <CardDescription>
              The active organization workspace for submissions, project review, and member access.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-px py-0 md:grid-cols-2 xl:grid-cols-4">
            {workspaceAreas.map((area, index) => (
              <Link
                key={area.href}
                href={area.href}
                className={`flex min-h-44 flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/45 ${
                  index < workspaceAreas.length - 1 ? "border-b md:border-r xl:border-b-0" : ""
                }`}
              >
                <area.icon className="size-4 text-muted-foreground" />
                <div className="space-y-2">
                  <div className="text-sm font-medium">{area.title}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{area.description}</p>
                </div>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium">
                  Open area
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <CardTitle>Submission lifecycle</CardTitle>
            <CardDescription>
              Your current role is {context.activeMember.role}. Owners and admins can manage every project in the organization, while members manage the projects they created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <LifecycleStep
              title="Create"
              description="The wizard stores the project immediately once the required metadata checks pass."
            />
            <LifecycleStep
              title="Process"
              description="Screenshot generation runs in the background, then UploadThing stores the preview."
            />
            <LifecycleStep
              title="Publish"
              description="Only complete listings with a valid screenshot make it into the public gallery."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function LifecycleStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-muted/35 px-4 py-4">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
