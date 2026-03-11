"use client"

import { useEffect, useState } from "react"
import { MoonStar, SunMedium } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = (theme: "light" | "dark" | null) => {
      const nextDark = theme ? theme === "dark" : media.matches
      root.classList.toggle("dark", nextDark)
      setIsDark(nextDark)
    }

    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "light" || storedTheme === "dark") {
      applyTheme(storedTheme)
    } else {
      applyTheme(null)
    }

    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme(null)
      }
    }

    media.addEventListener("change", handleChange)

    return () => media.removeEventListener("change", handleChange)
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    document.documentElement.classList.toggle("dark", nextDark)
    localStorage.setItem("theme", nextDark ? "dark" : "light")
    setIsDark(nextDark)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="size-9"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  )
}
