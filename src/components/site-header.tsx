import Link from 'next/link';

import { siteContent } from '@/content/site';
import { getSession } from '@/lib/session';
import { LinkButton } from '@/components/link-button';
import { MobileNav } from '@/components/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-primary text-sm font-semibold text-primary-foreground">
                A
            </span>
            <div className="min-w-0">
              <div className="truncate text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-base">
                {siteContent.brand.name}
              </div>
              <div className="hidden truncate text-[0.78rem] text-muted-foreground min-[430px]:block">
                {siteContent.brand.summary}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {siteContent.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <ThemeToggle />
            {session ? (
              <UserDropdown
                user={{
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                }}
              />
            ) : (
              <>
                <LinkButton href="/auth/sign-in" variant="outline" size="sm">
                  Sign in
                </LinkButton>
                <LinkButton href="/auth/sign-up" size="sm">
                  Create account
                </LinkButton>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileNav authenticated={Boolean(session)} />
          </div>
        </div>
      </div>
    </header>
  );
}
