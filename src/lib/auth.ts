import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { twoFactor } from "better-auth/plugins/two-factor"

import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { sendPasswordResetEmail, sendTwoFactorOtpEmail, sendVerificationEmail, sendWelcomeEmail } from "@/lib/email"
import { env } from "@/lib/env"

export const auth = betterAuth({
  appName: env.APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: false,
  }),
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        url,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        url,
      })
    },
  },
  session: {
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  rateLimit: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user) {
            return
          }

          await db
            .insert(schema.userProfiles)
            .values({
              userId: user.id,
            })
            .onConflictDoNothing()

          await sendWelcomeEmail({
            email: user.email,
            name: user.name,
          })
        },
      },
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  plugins: [
    nextCookies(),
    twoFactor({
      issuer: env.APP_NAME,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendTwoFactorOtpEmail({
            email: user.email,
            name: user.name,
            otp,
          })
        },
      },
      totpOptions: {},
      backupCodeOptions: {},
    }),
  ],
})
