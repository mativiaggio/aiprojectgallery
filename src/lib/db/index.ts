import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { env } from "@/lib/env"
import * as schema from "@/lib/db/schema"

declare global {
  var __aiprojectgalleryPool: Pool | undefined
}

const pool =
  globalThis.__aiprojectgalleryPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl:
      env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  })

if (env.NODE_ENV !== "production") {
  globalThis.__aiprojectgalleryPool = pool
}

export const db = drizzle(pool, { schema })
export { pool }
