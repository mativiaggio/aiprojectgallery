type RequiredEnvironmentVariable =
  | "DATABASE_URL"
  | "BETTER_AUTH_SECRET"
  | "BETTER_AUTH_URL"
  | "RESEND_API_KEY"
  | "RESEND_FROM_EMAIL"

function getRequiredEnv(name: RequiredEnvironmentVariable) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const nodeEnv = process.env.NODE_ENV ?? "development"
const betterAuthSecret = getRequiredEnv("BETTER_AUTH_SECRET")
const resendFromEmail = getRequiredEnv("RESEND_FROM_EMAIL").trim()

if (betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long")
}

if (nodeEnv === "production" && /@example\.com\b/i.test(resendFromEmail)) {
  throw new Error(
    "RESEND_FROM_EMAIL must use a verified domain in production. Use onboarding@resend.dev only for local development."
  )
}

export const env = {
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: betterAuthSecret,
  BETTER_AUTH_URL: getRequiredEnv("BETTER_AUTH_URL"),
  RESEND_API_KEY: getRequiredEnv("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: resendFromEmail,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "AI Project Gallery",
  NODE_ENV: nodeEnv,
}
