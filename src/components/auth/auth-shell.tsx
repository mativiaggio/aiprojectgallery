import type { ReactNode } from "react"

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <section className="flex flex-col gap-8 border-b pb-8 lg:border-b-0 lg:pb-0">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-0 border-y sm:grid-cols-3">
            <AuthNote
              title="Email + password"
              description="First-party credentials with verification and reset flows."
            />
            <AuthNote
              title="Two-factor ready"
              description="Authenticator apps, email OTP, and backup codes."
            />
            <AuthNote
              title="Profile controls"
              description="Identity, preferences, and account security in one place."
            />
          </div>
        </section>
        <section>{children}</section>
      </div>
    </div>
  )
}

function AuthNote({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="border-b py-5 sm:border-r sm:border-b-0 sm:px-6 sm:last:border-r-0 sm:first:pl-0 sm:last:pr-0">
      <div className="text-sm font-medium tracking-[-0.03em]">{title}</div>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  )
}
