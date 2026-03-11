"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ChevronRight,
  LogIn,
  Mail,
  MenuIcon,
  Plus,
  UserRound,
} from "lucide-react"

import { siteContent } from "@/content/site"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav({ authenticated = false }: { authenticated?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Open navigation"
            className="bg-background hover:bg-muted dark:bg-secondary dark:hover:bg-muted"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent className="w-[min(23rem,calc(100%-1rem))] gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{siteContent.brand.name}</SheetTitle>
          <SheetDescription>{siteContent.brand.summary}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="px-5 py-4">
            <div className="overflow-hidden rounded-lg border">
              {siteContent.navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-12 items-center justify-between gap-3 px-4 text-sm font-medium transition-colors hover:bg-muted ${
                    index > 0 ? "border-t" : ""
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-auto border-t px-5 py-4">
            <div className="overflow-hidden rounded-lg border">
              {authenticated ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between gap-3 px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-3">
                      <UserRound className="size-4 text-muted-foreground" />
                      Account
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between gap-3 border-t px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Plus className="size-4 text-muted-foreground" />
                      Submit a product
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between gap-3 px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-3">
                      <LogIn className="size-4 text-muted-foreground" />
                      Sign in
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between gap-3 border-t px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-3">
                      <UserRound className="size-4 text-muted-foreground" />
                      Create account
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </>
              )}

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-between gap-3 border-t px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  Contact
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
