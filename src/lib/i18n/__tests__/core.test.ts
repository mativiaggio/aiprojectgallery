import assert from "node:assert/strict"
import test from "node:test"

import { getDictionary, isLocale, localeCookieName, supportedLocales } from "@/lib/i18n"

function collectLeafKeys(value: unknown, path = ""): string[] {
  if (typeof value === "string" || Array.isArray(value)) {
    return [path]
  }

  if (!value || typeof value !== "object") {
    return []
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    collectLeafKeys(nested, path ? `${path}.${key}` : key),
  )
}

test("supported locales include english and spanish", () => {
  assert.deepEqual(supportedLocales, ["en", "es"])
  assert.equal(localeCookieName, "apg_locale")
  assert.equal(isLocale("en"), true)
  assert.equal(isLocale("es"), true)
  assert.equal(isLocale("fr"), false)
  assert.equal(isLocale(null), false)
})

test("english and spanish dictionaries expose the same translation keys", () => {
  const englishKeys = collectLeafKeys(getDictionary("en")).sort()
  const spanishKeys = collectLeafKeys(getDictionary("es")).sort()

  assert.deepEqual(spanishKeys, englishKeys)
})
