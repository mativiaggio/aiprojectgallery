import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="text-base font-medium">AI Project Gallery</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Discover what people actually shipped with AI, study the stack
            behind each launch, and publish your own projects in a public
            gallery built for curious builders.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            Browse projects
          </Link>
          <Link href="/submit" className="hover:text-foreground">
            Submit a project
          </Link>
          <Link href="/profile/matias" className="hover:text-foreground">
            Author profiles
          </Link>
          <Link href="/auth/sign-up" className="hover:text-foreground">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  )
}
