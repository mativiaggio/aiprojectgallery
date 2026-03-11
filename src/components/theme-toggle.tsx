"use client"

import { useSyncExternalStore } from "react"
import { CheckIcon, MonitorSmartphoneIcon, MoonStarIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Theme menu, currently dark" : "Theme menu, currently light"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={label}
            className="bg-background hover:bg-muted dark:bg-secondary dark:hover:bg-muted"
          />
        }
      >
        {isDark ? <MoonStarIcon /> : <SunIcon />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <SunIcon />
            Light
            {theme === "light" ? <CheckIcon className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <MoonStarIcon />
            Dark
            {theme === "dark" ? <CheckIcon className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <MonitorSmartphoneIcon />
            System
            {theme === "system" ? <CheckIcon className="ml-auto" /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
