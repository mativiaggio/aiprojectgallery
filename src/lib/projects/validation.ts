import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

import type {
  ProjectUpdatePayload,
  SubmissionFieldErrors,
  SubmissionPayload,
} from "@/lib/projects/types"

const RESERVED_HOST_SUFFIXES = [
  ".internal",
  ".local",
  ".localhost",
  ".test",
  ".invalid",
] as const

const DEFAULT_PORTS = new Set(["", "80", "443"])

type ValidationResult =
  | {
      ok: true
      data: {
        name: string
        shortDescription: string
        appUrl: string
        normalizedAppUrl: string
        repositoryUrl: string | null
        aiTools: string[]
        tags: string[]
      }
    }
  | {
      ok: false
      message: string
      fieldErrors: SubmissionFieldErrors
    }

export async function validateSubmissionPayload(
  payload: SubmissionPayload
): Promise<ValidationResult> {
  return validateProjectPayload(payload)
}

export async function validateProjectUpdatePayload(
  payload: ProjectUpdatePayload
): Promise<ValidationResult> {
  return validateProjectPayload(payload)
}

export function getHostnameFromUrl(rawUrl: string) {
  return new URL(rawUrl).hostname.toLowerCase()
}

async function validateProjectPayload(
  payload: SubmissionPayload | ProjectUpdatePayload
): Promise<ValidationResult> {
  const name = payload.name.trim()
  const shortDescription = payload.shortDescription.trim()
  const appUrl = payload.appUrl.trim()
  const repositoryUrl = payload.repositoryUrl?.trim() ?? ""
  const aiTools = normalizeTokens(payload.aiTools, 8)
  const tags = normalizeTokens(payload.tags, 8)
  const fieldErrors: SubmissionFieldErrors = {}

  if (name.length < 2 || name.length > 80) {
    fieldErrors.name = "Use a project name between 2 and 80 characters."
  }

  if (shortDescription.length < 24 || shortDescription.length > 220) {
    fieldErrors.shortDescription =
      "Write a short description between 24 and 220 characters."
  }

  if (aiTools.length === 0) {
    fieldErrors.aiTools = "Add at least one AI tool used in the product."
  }

  if (tags.length > 0 && tags.some((tag) => tag.length < 2)) {
    fieldErrors.tags = "Tags should be at least 2 characters long."
  }

  let normalizedAppUrl: string | null = null

  try {
    normalizedAppUrl = await normalizePublicUrl(appUrl)
  } catch (error) {
    fieldErrors.appUrl =
      error instanceof Error ? error.message : "Use a valid public application URL."
  }

  let normalizedRepositoryUrl: string | null = null

  if (repositoryUrl) {
    try {
      normalizedRepositoryUrl = await normalizePublicUrl(repositoryUrl, {
        allowHttp: false,
        allowPath: true,
      })
    } catch (error) {
      fieldErrors.repositoryUrl =
        error instanceof Error ? error.message : "Use a valid repository URL."
    }
  }

  if (Object.keys(fieldErrors).length > 0 || !normalizedAppUrl) {
    return {
      ok: false,
      message: "Please review the highlighted fields and try again.",
      fieldErrors,
    }
  }

  return {
    ok: true,
    data: {
      name,
      shortDescription,
      appUrl: normalizedAppUrl,
      normalizedAppUrl,
      repositoryUrl: normalizedRepositoryUrl,
      aiTools,
      tags,
    },
  }
}

export function createProjectSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const safeBase = base || "project"
  return `${safeBase}-${crypto.randomUUID().slice(0, 8)}`
}

function normalizeTokens(values: string[], maxItems: number) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
    .map((value) => value.slice(0, 40))
    .slice(0, maxItems)
}

async function normalizePublicUrl(
  rawValue: string,
  options: {
    allowHttp?: boolean
    allowPath?: boolean
  } = {}
) {
  if (!rawValue) {
    throw new Error("This URL is required.")
  }

  const value = rawValue.startsWith("http://") || rawValue.startsWith("https://")
    ? rawValue
    : `https://${rawValue}`

  const url = new URL(value)

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.")
  }

  if (!options.allowHttp && url.protocol !== "https:") {
    throw new Error("Use an https URL for the repository.")
  }

  if (url.username || url.password) {
    throw new Error("Authenticated URLs are not allowed.")
  }

  if (!DEFAULT_PORTS.has(url.port)) {
    throw new Error("Use a public default port only.")
  }

  const hostname = url.hostname.toLowerCase()

  if (isForbiddenHostname(hostname)) {
    throw new Error("Use a public hostname, not a local or private address.")
  }

  await assertResolvesToPublicAddress(hostname)

  url.hash = ""
  url.search = ""
  url.hostname = hostname

  if (!options.allowPath) {
    url.pathname = normalizePathname(url.pathname)
  } else {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/"
  }

  return url.toString()
}

function normalizePathname(pathname: string) {
  return pathname === "/" ? "/" : pathname.replace(/\/+$/, "")
}

function isForbiddenHostname(hostname: string) {
  if (!hostname || hostname === "localhost") {
    return true
  }

  if (hostname.endsWith(".localhost")) {
    return true
  }

  if (RESERVED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return true
  }

  if (!hostname.includes(".") && isIP(hostname) === 0) {
    return true
  }

  const ipVersion = isIP(hostname)

  if (ipVersion === 4) {
    return isPrivateIPv4(hostname)
  }

  if (ipVersion === 6) {
    return isPrivateIPv6(hostname)
  }

  return false
}

async function assertResolvesToPublicAddress(hostname: string) {
  const records = await lookup(hostname, { all: true, verbatim: true }).catch(() => null)

  if (!records || records.length === 0) {
    throw new Error("This hostname could not be resolved.")
  }

  const hasPrivateAddress = records.some((record) =>
    record.family === 6 ? isPrivateIPv6(record.address) : isPrivateIPv4(record.address)
  )

  if (hasPrivateAddress) {
    throw new Error("Use a public hostname, not a private network address.")
  }
}

function isPrivateIPv4(address: string) {
  const [a, b] = address.split(".").map((part) => Number(part))

  if ([a, b].some((part) => Number.isNaN(part))) {
    return true
  }

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

function isPrivateIPv6(address: string) {
  const normalized = address.toLowerCase()

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  )
}
