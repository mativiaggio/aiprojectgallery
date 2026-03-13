export function slugifyTerm(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function stripHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function extractMetaContent(html: string, name: string) {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  )
  return regex.exec(html)?.[1]?.trim() ?? null
}

export function extractTitle(html: string) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
}

export function extractHeadings(html: string) {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => stripHtml(match[1] ?? ""))
    .filter(Boolean)
}

export function extractLinks(html: string) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(
    (match) => ({
      href: match[1] ?? "",
      label: stripHtml(match[2] ?? ""),
    })
  )
}

export function normalizeSet(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])]
}

export function summarizeList(values: string[]) {
  if (values.length === 0) {
    return "None"
  }

  return values.join(", ")
}
