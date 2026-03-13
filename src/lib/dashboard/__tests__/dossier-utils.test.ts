import assert from "node:assert/strict"
import test from "node:test"

import {
  buildArchitectureEvidence,
  dedupeStringsPreservingOrder,
} from "@/lib/dashboard/dossier-utils"

test("dedupeStringsPreservingOrder keeps first occurrence order", () => {
  assert.deepEqual(
    dedupeStringsPreservingOrder([
      "Proof points strengthen the reliability of this capability hypothesis.",
      "Public documentation is visible.",
      "Proof points strengthen the reliability of this capability hypothesis.",
      "Docs often accompany structured programmatic outputs.",
      "Public documentation is visible.",
    ]),
    [
      "Proof points strengthen the reliability of this capability hypothesis.",
      "Public documentation is visible.",
      "Docs often accompany structured programmatic outputs.",
    ],
  )
})

test("buildArchitectureEvidence deduplicates repeated capability evidence before slicing", () => {
  const evidence = buildArchitectureEvidence([
    {
      evidence: [
        "Proof points strengthen the reliability of this capability hypothesis.",
        "Public documentation is visible.",
      ],
    },
    {
      evidence: [
        "Proof points strengthen the reliability of this capability hypothesis.",
        "Docs often accompany structured programmatic outputs.",
      ],
    },
  ])

  assert.deepEqual(evidence, [
    "Proof points strengthen the reliability of this capability hypothesis.",
    "Public documentation is visible.",
    "Docs often accompany structured programmatic outputs.",
  ])
})
