import type { Metadata } from "next"
import { IBM_Plex_Mono, Manrope } from "next/font/google"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

import "./globals.css"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "AI Project Gallery",
  description:
    "A community-driven gallery of web products built with AI tools like ChatGPT, Codex, Cursor, Claude, Bolt, and Lovable.",
}

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var shouldUseDark = stored ? stored === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch (error) {}
  })();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${plexMono.variable}`}
    >
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
