type RequiredEnvironmentVariable =
  | "DATABASE_URL"
  | "BETTER_AUTH_SECRET"
  | "BETTER_AUTH_URL"

function getRequiredEnv(name: RequiredEnvironmentVariable) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim()

  return value ? value : undefined
}

const nodeEnv = process.env.NODE_ENV ?? "development"
const betterAuthSecret = getRequiredEnv("BETTER_AUTH_SECRET")
const resendApiKey = getOptionalEnv("RESEND_API_KEY")
const resendFromEmail = getOptionalEnv("RESEND_FROM_EMAIL")

if (betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long")
}

export const env = {
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: betterAuthSecret,
  BETTER_AUTH_URL: getRequiredEnv("BETTER_AUTH_URL"),
  RESEND_API_KEY: resendApiKey,
  RESEND_FROM_EMAIL: resendFromEmail,
  UPLOADTHING_TOKEN: getOptionalEnv("UPLOADTHING_TOKEN"),
  UPLOADTHING_SECRET: getOptionalEnv("UPLOADTHING_SECRET"),
  UPLOADTHING_APP_ID: getOptionalEnv("UPLOADTHING_APP_ID"),
  CRON_SECRET: getOptionalEnv("CRON_SECRET"),
  GITHUB_TOKEN: getOptionalEnv("GITHUB_TOKEN"),
  OPENAI_API_KEY: getOptionalEnv("OPENAI_API_KEY"),
  OPENAI_MODEL: getOptionalEnv("OPENAI_MODEL") ?? "gpt-5-mini",
  APP_NAME: getOptionalEnv("NEXT_PUBLIC_APP_NAME") ?? "AI Project Gallery",
  NODE_ENV: nodeEnv,
}
