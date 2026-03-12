import type { Metadata } from "next"
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google"

import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: {
    default: "AI Project Gallery",
    template: "%s | AI Project Gallery",
  },
  description:
    "Curated directory of live AI products with product summaries, model stacks, and platform details.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${ibmPlexMono.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <AppShell publicHeader={<SiteHeader />} publicFooter={<SiteFooter />}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
