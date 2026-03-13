import { env } from "@/lib/env"

export function isAuthorizedCronRequest(request: Request) {
  if (!env.CRON_SECRET) {
    return false
  }

  const authHeader = request.headers.get("authorization")
  const cronHeader = request.headers.get("x-cron-secret")

  return authHeader === `Bearer ${env.CRON_SECRET}` || cronHeader === env.CRON_SECRET
}
