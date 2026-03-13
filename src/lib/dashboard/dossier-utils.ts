export function dedupeStringsPreservingOrder(values: string[]) {
  const seen = new Set<string>()

  return values.filter((value) => {
    if (seen.has(value)) {
      return false
    }

    seen.add(value)
    return true
  })
}

export function buildArchitectureEvidence(
  capabilities: Array<{ evidence: string[] }>,
  limit = 3,
) {
  return dedupeStringsPreservingOrder(
    capabilities.flatMap((capability) => dedupeStringsPreservingOrder(capability.evidence)),
  ).slice(0, limit)
}
