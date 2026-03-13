"use client"

import { usePathname } from "next/navigation"

import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserDropdown } from "@/components/user-dropdown"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useI18n } from "@/lib/i18n/provider"

type DashboardHeaderProps = {
  user: {
    name: string
    email: string
    image?: string | null
  }
  activeOrganization: {
    id: string
    name: string
    slug: string
  } | null
  organizations: Array<{
    id: string
    name: string
    slug: string
    memberRole: string
  }>
  pendingInvitationsCount: number
}

export function DashboardHeader({
  user,
  activeOrganization,
  organizations,
  pendingInvitationsCount,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const { locale } = useI18n()
  const copy = getHeaderCopy(pathname, locale)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="lg:hidden" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold tracking-[-0.03em]">{copy.title}</div>
          <div className="truncate text-sm text-muted-foreground">{copy.description}</div>
        </div>
        <OrganizationSwitcher
          activeOrganization={activeOrganization}
          organizations={organizations}
          pendingInvitationsCount={pendingInvitationsCount}
        />
        <LanguageSwitcher />
        <ThemeToggle />
        <UserDropdown user={user} />
      </div>
    </header>
  )
}

function getHeaderCopy(pathname: string, locale: "en" | "es") {
  const titles =
    locale === "es"
      ? {
          "/dashboard": {
            title: "Resumen",
            description:
              "Un home compacto para la cuenta, los proyectos y el flujo vivo de envíos.",
          },
          "/dashboard/projects": {
            title: "Proyectos",
            description:
              "Sigue las fichas publicadas, los estados de procesamiento y los proyectos que necesitan otra pasada de screenshot.",
          },
          "/dashboard/submissions": {
            title: "Envíos",
            description:
              "Crea un nuevo envío y monitorea el pipeline de screenshots en tiempo real.",
          },
          "/dashboard/account": {
            title: "Cuenta",
            description:
              "Perfil, preferencias de notificación y seguridad dentro del dashboard.",
          },
          "/dashboard/collections": {
            title: "Colecciones",
            description:
              "Sets privados de research, briefs generados y links read-only para compartir.",
          },
          "/dashboard/intelligence": {
            title: "Intelligence",
            description:
              "Módulos privados de research para dossiers de sistema, mapeo de capacidades y movimiento de mercado.",
          },
          "/dashboard/genome": {
            title: "Capability genome",
            description:
              "Compara el corpus por capacidades atómicas de IA en lugar de categorías amplias.",
          },
          "/dashboard/time-machine": {
            title: "Category time machine",
            description:
              "Sigue cómo cambian docs, pricing y onboarding entre categorías a lo largo del tiempo.",
          },
          "/dashboard/organization": {
            title: "Organización",
            description: "Miembros, invitaciones y ajustes de la organización actual.",
          },
          "/dashboard/onboarding/organization": {
            title: "Crear organización",
            description: "Crea el primer workspace compartido o añade otra organización.",
          },
          "/dashboard/select-organization": {
            title: "Seleccionar organización",
            description: "Elige un workspace activo o revisa invitaciones pendientes.",
          },
        }
      : {
          "/dashboard": {
            title: "Overview",
            description:
              "A compact home for the account, projects, and the live submissions workflow.",
          },
          "/dashboard/projects": {
            title: "Projects",
            description:
              "Track published listings, processing states, and any projects that need another screenshot pass.",
          },
          "/dashboard/submissions": {
            title: "Submissions",
            description:
              "Create a new project submission and monitor the screenshot pipeline in real time.",
          },
          "/dashboard/account": {
            title: "Account",
            description:
              "Profile, notification preferences, and security settings inside the dashboard.",
          },
          "/dashboard/collections": {
            title: "Collections",
            description: "Private research sets, generated briefs, and shareable read-only links.",
          },
          "/dashboard/intelligence": {
            title: "Intelligence",
            description:
              "Private research modules for system dossiers, capability mapping, and market movement.",
          },
          "/dashboard/genome": {
            title: "Capability genome",
            description:
              "Compare the corpus by atomic AI capabilities instead of broad categories.",
          },
          "/dashboard/time-machine": {
            title: "Category time machine",
            description:
              "Track how docs, pricing, and onboarding posture change across categories over time.",
          },
          "/dashboard/organization": {
            title: "Organization",
            description: "Members, invitations, and the current organization settings.",
          },
          "/dashboard/onboarding/organization": {
            title: "Create organization",
            description: "Create the first shared workspace or add another organization.",
          },
          "/dashboard/select-organization": {
            title: "Select organization",
            description: "Choose an active workspace or review pending invitations.",
          },
        }

  return (
    titles[pathname as keyof typeof titles] ??
    (pathname.startsWith("/dashboard/projects/")
      ? {
          title: locale === "es" ? "Detalle del proyecto" : "Project detail",
          description:
            locale === "es"
              ? "Revisa un envío, vuelve a abrir links y reintenta el pipeline de preview si hace falta."
              : "Review one submission, reopen links, and retry the preview pipeline if needed.",
        }
      : pathname.startsWith("/dashboard/collections/")
        ? {
            title: locale === "es" ? "Detalle de colección" : "Collection detail",
            description:
              locale === "es"
                ? "Revisa un set de research, genera el último brief y gestiona el sharing."
                : "Review one research set, generate the latest brief, and manage sharing.",
          }
        : titles["/dashboard"])
  )
}
