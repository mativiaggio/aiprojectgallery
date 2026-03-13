const DEFAULT_AUTH_CALLBACK_URL = "/dashboard"
const AUTH_CALLBACK_STORAGE_KEY = "aiprojectgallery.auth.callback-url"

export function normalizeCallbackURL(
  callbackURL: string | null | undefined,
  fallback = DEFAULT_AUTH_CALLBACK_URL
) {
  if (!callbackURL) {
    return fallback
  }

  if (!callbackURL.startsWith("/") || callbackURL.startsWith("//")) {
    return fallback
  }

  return callbackURL
}

export function withCallbackURL(pathname: string, callbackURL: string) {
  const normalized = normalizeCallbackURL(callbackURL)
  const separator = pathname.includes("?") ? "&" : "?"

  return `${pathname}${separator}callbackURL=${encodeURIComponent(normalized)}`
}

export function storePendingCallbackURL(callbackURL: string) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    AUTH_CALLBACK_STORAGE_KEY,
    normalizeCallbackURL(callbackURL)
  )
}

export function readPendingCallbackURL() {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_CALLBACK_URL
  }

  return normalizeCallbackURL(
    window.sessionStorage.getItem(AUTH_CALLBACK_STORAGE_KEY)
  )
}

export function clearPendingCallbackURL() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY)
}

export { AUTH_CALLBACK_STORAGE_KEY, DEFAULT_AUTH_CALLBACK_URL }
