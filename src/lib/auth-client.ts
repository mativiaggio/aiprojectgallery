"use client"

import { createAuthClient } from "better-auth/react"
import { organizationClient, twoFactorClient } from "better-auth/client/plugins"

import { readPendingCallbackURL } from "@/lib/auth/callback-url"

function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    return new URL("/api/auth", window.location.origin).toString()
  }

  const appURL =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"

  return new URL("/api/auth", appURL).toString()
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect: async () => {
        const callbackURL = readPendingCallbackURL()
        window.location.assign(
          `/auth/two-factor?callbackURL=${encodeURIComponent(callbackURL)}`
        )
      },
    }),
  ],
})
