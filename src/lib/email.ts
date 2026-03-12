import { Resend } from "resend"

import { env } from "@/lib/env"

const resend = new Resend(env.RESEND_API_KEY)
const RESEND_TEST_FROM_EMAIL = "onboarding@resend.dev"
const resendFromEmail =
  env.NODE_ENV !== "production" && /@example\.com\b/i.test(env.RESEND_FROM_EMAIL)
    ? `${env.APP_NAME} <${RESEND_TEST_FROM_EMAIL}>`
    : env.RESEND_FROM_EMAIL

// if (resendFromEmail !== env.RESEND_FROM_EMAIL) {
//   console.warn(
//     `[resend] Using ${RESEND_TEST_FROM_EMAIL} in development because RESEND_FROM_EMAIL is set to an unverified example.com address.`
//   )
// }

type EmailTemplateProps = {
  ctaHref?: string
  ctaLabel?: string
  preview: string
  title: string
  intro: string
  body: string
  outro?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderEmailTemplate({
  ctaHref,
  ctaLabel,
  preview,
  title,
  intro,
  body,
  outro,
}: EmailTemplateProps) {
  const safeTitle = escapeHtml(title)
  const safePreview = escapeHtml(preview)
  const safeIntro = escapeHtml(intro)
  const safeBody = escapeHtml(body)
  const safeOutro = outro ? escapeHtml(outro) : null
  const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : null

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <div style="margin:0;padding:32px 16px;background:#f5f5f7;font-family:SF Pro Display,SF Pro Text,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#111114;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(17,17,20,0.09);border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:28px 28px 18px;border-bottom:1px solid rgba(17,17,20,0.09);">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:14px;background:#ff3b30;color:#fff8f8;font-size:16px;font-weight:700;">A</div>
            <p style="margin:18px 0 8px;font-size:30px;line-height:1.05;font-weight:600;letter-spacing:-0.04em;color:#111114;">${safeTitle}</p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#686874;">${safeIntro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px 10px;">
            <p style="margin:0;font-size:15px;line-height:1.8;color:#1b1b1f;">${safeBody}</p>
            ${
              ctaHref && safeCtaLabel
                ? `
              <div style="padding-top:24px;">
                <a href="${ctaHref}" style="display:inline-block;border-radius:14px;background:#ff3b30;color:#fff8f8;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:600;">
                  ${safeCtaLabel}
                </a>
              </div>
            `
                : ""
            }
          </td>
        </tr>
        ${
          safeOutro
            ? `
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.8;color:#686874;">${safeOutro}</p>
            </td>
          </tr>
        `
            : ""
        }
      </table>
    </div>
  `
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const result = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject,
    html,
  })

  if (result.error) {
    const details = [
      `name=${result.error.name}`,
      `status=${result.error.statusCode ?? "unknown"}`,
      `message=${result.error.message}`,
      `to=${to}`,
      `subject=${subject}`,
    ].join(" ")

    console.error(`[resend] Email delivery failed ${details}`)

    throw new Error(`Email delivery failed: ${result.error.message}`)
  }
}

export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  await sendEmail({
    to: email,
    subject: `Welcome to ${env.APP_NAME}`,
    html: renderEmailTemplate({
      preview: `Welcome to ${env.APP_NAME}`,
      title: `Welcome, ${name}`,
      intro: "Your account is ready.",
      body: "You can now manage your profile, secure your account with two-factor authentication, and keep your submission preferences in one place.",
      ctaHref: `${env.BETTER_AUTH_URL}/account`,
      ctaLabel: "Open your account",
      outro: "If you did not create this account, you should reset your password immediately.",
    }),
  })
}

export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string
  name: string
  url: string
}) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: renderEmailTemplate({
      preview: "Confirm your email address",
      title: "Verify your email",
      intro: `Confirm the address for ${name} to finish setting up your account.`,
      body: "This link confirms your account and unlocks the security settings tied to your identity.",
      ctaHref: url,
      ctaLabel: "Verify email",
      outro: "This link expires automatically. If it expires, request a new verification email from the app.",
    }),
  })
}

export async function sendPasswordResetEmail({
  email,
  name,
  url,
}: {
  email: string
  name: string
  url: string
}) {
  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: renderEmailTemplate({
      preview: "Reset your password securely",
      title: "Reset password",
      intro: `A password reset was requested for ${name}.`,
      body: "Use the secure link below to choose a new password. If you did not request this change, you can ignore this email.",
      ctaHref: url,
      ctaLabel: "Choose a new password",
      outro: "For security reasons, the link is time-limited and can only be used once.",
    }),
  })
}

export async function sendTwoFactorOtpEmail({
  email,
  name,
  otp,
}: {
  email: string
  name: string
  otp: string
}) {
  await sendEmail({
    to: email,
    subject: "Your two-factor verification code",
    html: renderEmailTemplate({
      preview: "Your verification code is ready",
      title: "Two-factor verification",
      intro: `Use this one-time code to continue as ${name}.`,
      body: `Your verification code is ${otp}. Enter it in the security prompt to finish signing in.`,
      outro: "The code expires quickly. If it expires, request a new one from the sign-in flow.",
    }),
  })
}
