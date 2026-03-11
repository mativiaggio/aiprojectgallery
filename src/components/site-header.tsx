import Link from "next/link"

import { ButtonLink } from "@/components/button-link"
import { ThemeToggle } from "@/components/theme-toggle"

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Gallery" },
  { href: "/submit", label: "Submit" },
  { href: "/profile/matias", label: "Profile" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold shadow-sm">
              AI
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em]">
                AI Project Gallery
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Community-built work shipped with AI
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink
            href="/auth/sign-in"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            Sign in
          </ButtonLink>
          <ButtonLink href="/submit" className="px-3 sm:px-4">
            Submit
          </ButtonLink>
        </div>
      </div>
    </header>
  )
}
