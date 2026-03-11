import type { Config } from "drizzle-kit"

import { env } from "./src/lib/env"

export default {
  dialect: "postgresql",
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config
