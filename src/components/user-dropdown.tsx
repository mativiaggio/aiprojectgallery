"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Bell,
  ChevronRight,
  LogOut,
  MessageSquareMore,
  Plus,
  Shield,
  UserRound,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserDropdownProps = {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const initials = getInitials(user.name)

  async function handleSignOut() {
    setIsPending(true)

    try {
      await authClient.$fetch("/sign-out", {
        method: "POST",
        body: {},
      })

      router.replace("/")
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        }
      >
        <Avatar name={user.name} image={user.image} initials={initials} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[320px] min-w-[320px] p-0"
      >
        <div className="flex items-start gap-3 p-4">
          <Avatar name={user.name} image={user.image} initials={initials} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-sm text-muted-foreground">{user.email}</div>
          </div>
          <div className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            Personal
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="p-2">
          <MenuLink
            icon={UserRound}
            label="Your profile"
            description="Account details and public identity"
            onSelect={() => router.push("/account#profile")}
          />
          <MenuLink
            icon={Bell}
            label="Notifications"
            description="Delivery preferences and email settings"
            onSelect={() => router.push("/account#preferences")}
          />
          <MenuLink
            icon={Shield}
            label="Security"
            description="Password, verification, and 2FA"
            onSelect={() => router.push("/account#security")}
          />
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="p-2">
          <MenuLink
            icon={Plus}
            label="Submit a product"
            description="Send a project for review"
            onSelect={() => router.push("/contact")}
          />
          <MenuLink
            icon={MessageSquareMore}
            label="Get help"
            description="Talk to us about listings or access"
            onSelect={() => router.push("/contact")}
          />
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="p-2">
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            disabled={isPending}
            className="min-h-11 rounded-lg px-3"
          >
            <LogOut className="size-4" />
            {isPending ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuLink({
  icon: Icon,
  label,
  description,
  onSelect,
}: {
  icon: typeof UserRound
  label: string
  description: string
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className="min-h-14 rounded-lg px-3 py-2.5"
    >
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="truncate text-sm text-muted-foreground">{description}</div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </DropdownMenuItem>
  )
}

function Avatar({
  name,
  image,
  initials,
  size = "sm",
}: {
  name: string
  image?: string | null
  initials: string
  size?: "sm" | "lg"
}) {
  const classes =
    size === "lg"
      ? "h-11 w-11 text-sm"
      : "h-8 w-8 text-xs"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border border-border bg-muted font-medium text-foreground",
        "inline-flex items-center justify-center",
        classes
      )}
    >
      {image ? (
        <Image src={image} alt={name} fill sizes="44px" className="object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return "A"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
