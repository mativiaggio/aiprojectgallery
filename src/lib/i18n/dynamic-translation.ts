import { createHash, randomUUID } from "node:crypto"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { localizedTextCache } from "@/lib/db/schema"
import { env } from "@/lib/env"
import type { Locale } from "@/lib/i18n"

type TranslationFieldMap = Record<string, string | null | undefined>

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

export function hashTranslationSource(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export async function translateFields({
  entityType,
  entityId,
  locale,
  fields,
}: {
  entityType: string
  entityId: string
  locale: Locale
  fields: TranslationFieldMap
}) {
  const entries = Object.entries(fields).filter(([, value]) => Boolean(value?.trim()))

  if (locale !== "es" || entries.length === 0) {
    return Object.fromEntries(entries.map(([key, value]) => [key, value ?? null])) as Record<
      string,
      string | null
    >
  }

  const hashes = new Map(entries.map(([key, value]) => [key, hashTranslationSource(value!.trim())]))
  const existing = await db
    .select()
    .from(localizedTextCache)
    .where(
      and(
        eq(localizedTextCache.entityType, entityType),
        eq(localizedTextCache.entityId, entityId),
        eq(localizedTextCache.targetLocale, locale),
        inArray(
          localizedTextCache.field,
          entries.map(([key]) => key)
        )
      )
    )

  const cached = new Map(
    existing.map((row) => [`${row.field}:${row.sourceHash}`, row.translatedText])
  )
  const output = new Map<string, string | null>()
  const missing: Array<{ key: string; value: string }> = []

  for (const [key, value] of entries) {
    const trimmed = value!.trim()
    const cacheKey = `${key}:${hashes.get(key)}`
    const hit = cached.get(cacheKey)

    if (hit) {
      output.set(key, hit)
      continue
    }

    missing.push({ key, value: trimmed })
  }

  if (missing.length === 0) {
    return Object.fromEntries(output) as Record<string, string | null>
  }

  const translated = await requestTranslations(missing)

  if (translated.size > 0) {
    await db
      .insert(localizedTextCache)
      .values(
        missing
          .map(({ key }) => {
            const translatedText = translated.get(key)

            if (!translatedText) {
              return null
            }

            return {
              id: randomUUID(),
              entityType,
              entityId,
              field: key,
              targetLocale: locale,
              sourceHash: hashes.get(key)!,
              translatedText,
              model: env.OPENAI_MODEL,
              updatedAt: new Date(),
            }
          })
          .filter(Boolean) as Array<typeof localizedTextCache.$inferInsert>
      )
      .onConflictDoNothing()
      .catch(() => null)
  }

  for (const { key, value } of missing) {
    output.set(key, translated.get(key) ?? value)
  }

  return Object.fromEntries(output) as Record<string, string | null>
}

export async function translateText({
  entityType,
  entityId,
  field,
  locale,
  value,
}: {
  entityType: string
  entityId: string
  field: string
  locale: Locale
  value: string | null | undefined
}) {
  if (!value) {
    return value ?? null
  }

  const translated = await translateFields({
    entityType,
    entityId,
    locale,
    fields: {
      [field]: value,
    },
  })

  return translated[field] ?? value
}

async function requestTranslations(entries: Array<{ key: string; value: string }>) {
  if (!env.OPENAI_API_KEY || entries.length === 0) {
    return new Map<string, string>()
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Translate the provided fields from English to neutral Spanish. Preserve product names, company names, URLs, code symbols, model names, and numbers. If a field is already in Spanish, keep it unchanged. Return only valid JSON with the same keys.",
          },
          {
            role: "user",
            content: JSON.stringify(
              Object.fromEntries(entries.map((entry) => [entry.key, entry.value]))
            ),
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      return new Map<string, string>()
    }

    const payload = (await response.json()) as OpenAiResponse
    const content = payload.choices?.[0]?.message?.content ?? ""
    const parsed = safeParseJson(content)

    if (!parsed || typeof parsed !== "object") {
      return new Map<string, string>()
    }

    return new Map(
      entries
        .map(({ key, value }) => {
          const translated = (parsed as Record<string, unknown>)[key]

          return [
            key,
            typeof translated === "string" && translated.trim() ? translated.trim() : value,
          ] as const
        })
    )
  } catch {
    return new Map<string, string>()
  }
}

function safeParseJson(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)

    if (!match) {
      return null
    }

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}
