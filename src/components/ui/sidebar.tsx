"use client"

import * as React from "react"
import { PanelLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const SIDEBAR_COOKIE_NAME = "dashboard-sidebar"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  isMobile: boolean
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const open = openProp ?? internalOpen
  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const nextOpen = typeof value === "function" ? value(open) : value

      if (onOpenChange) {
        onOpenChange(nextOpen)
      } else {
        setInternalOpen(nextOpen)
      }

      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      }
    },
    [onOpenChange, open]
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)")

    function updateMatches(event?: MediaQueryListEvent) {
      setIsMobile(event ? event.matches : mediaQuery.matches)
    }

    updateMatches()
    mediaQuery.addEventListener("change", updateMatches)

    return () => mediaQuery.removeEventListener("change", updateMatches)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current)
      return
    }

    setOpen((current) => !current)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": "16rem",
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar-wrapper flex h-full max-h-full w-full overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"aside">) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="h-[calc(100svh-1rem)] w-[min(18rem,calc(100%-1rem))] gap-0 overflow-hidden border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-none"
        >
          <aside
            data-slot="sidebar"
            className={cn("flex h-full max-h-full flex-col overflow-hidden", className)}
            {...props}
          >
            {children}
          </aside>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "hidden h-full max-h-full shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,border-color] duration-200 lg:flex lg:flex-col",
        open ? "w-[var(--sidebar-width)]" : "w-0 border-r-transparent",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("z-10 shrink-0 border-b border-sidebar-border bg-sidebar px-4 py-4", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("min-h-0 flex flex-1 flex-col overflow-y-auto px-3 py-4", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("z-10 shrink-0 border-t border-sidebar-border bg-sidebar px-3 py-3", className)}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("space-y-1.5", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("px-3 pb-1 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("space-y-1", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("space-y-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
}) {
  const classes = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
    className
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string
      "data-active"?: boolean
    }>

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      "data-active": isActive,
    })
  }

  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
