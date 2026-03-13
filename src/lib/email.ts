import { Resend } from "resend"

import { env } from "@/lib/env"

const RESEND_TEST_FROM_EMAIL = "onboarding@resend.dev"
const resendConfigured = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null
const resendFromEmail =
  env.RESEND_FROM_EMAIL &&
  env.NODE_ENV !== "production" &&
  /@example\.com\b/i.test(env.RESEND_FROM_EMAIL)
    ? `${env.APP_NAME} <${RESEND_TEST_FROM_EMAIL}>`
    : env.RESEND_FROM_EMAIL
let hasLoggedMissingResendConfig = false
let hasLoggedInvalidResendSender = false

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
  if (!resendConfigured || !resend || !resendFromEmail) {
    if (!hasLoggedMissingResendConfig) {
      console.warn(
        "[resend] Email delivery is disabled because RESEND_API_KEY or RESEND_FROM_EMAIL is not configured."
      )
      hasLoggedMissingResendConfig = true
    }

    return
  }

  if (
    env.NODE_ENV === "production" &&
    /@example\.com\b/i.test(resendFromEmail) &&
    !hasLoggedInvalidResendSender
  ) {
    console.warn(
      "[resend] RESEND_FROM_EMAIL uses an example.com sender in production. Email delivery may fail until a verified sender is configured."
    )
    hasLoggedInvalidResendSender = true
  }

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
      body: "You can now manage your account, secure it with two-factor authentication, and join or create shared workspaces in the dashboard.",
      ctaHref: `${env.BETTER_AUTH_URL}/dashboard`,
      ctaLabel: "Open dashboard",
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

export async function sendOrganizationInvitationEmail({
  email,
  inviterName,
  organizationName,
  role,
  url,
}: {
  email: string
  inviterName: string
  organizationName: string
  role: string
  url: string
}) {
  await sendEmail({
    to: email,
    subject: `Invitation to join ${organizationName}`,
    html: renderEmailTemplate({
      preview: `Join ${organizationName} on ${env.APP_NAME}`,
      title: "Organization invitation",
      intro: `${inviterName} invited you to join ${organizationName}.`,
      body: `Open the invitation link to join the organization as ${role}. If you do not have an account yet, sign up with this same email address and return to the invitation link after verifying your email.`,
      ctaHref: url,
      ctaLabel: "Review invitation",
      outro: "The invitation expires automatically. If the link no longer works, ask the sender to issue a new invite.",
    }),
  })
}

export async function sendWeeklyDigestEmail({
  email,
  name,
  changes,
}: {
  email: string
  name: string
  changes: Array<{
    title: string
    detail: string
    projectName: string
    href: string
    detectedAt: string
  }>
}) {
  const introLine = changes[0]
    ? `${changes[0].projectName}: ${changes[0].title}`
    : "A weekly digest is ready."
  const body = changes
    .slice(0, 6)
    .map((change) => {
      const dateLabel = new Date(change.detectedAt).toLocaleDateString()
      return `${change.projectName} (${dateLabel}) - ${change.title}. ${change.detail}`
    })
    .join("\n")

  await sendEmail({
    to: email,
    subject: `${env.APP_NAME} weekly research digest`,
    html: renderEmailTemplate({
      preview: `${name}, your weekly research digest is ready`,
      title: "Weekly research digest",
      intro: `${name}, here are the most notable changes captured across the gallery this week.`,
      body: `${introLine}\n\n${body}`,
      ctaHref: `${env.BETTER_AUTH_URL}/pulse`,
      ctaLabel: "Open pulse feed",
      outro: "You can manage digest preferences from your account settings.",
    }).replaceAll("\n", "<br />"),
  })
}
