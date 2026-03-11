import type { Metadata } from "next"

import { siteContent } from "@/content/site"
import { ContactForm } from "@/components/marketing/contact-form"

export const metadata: Metadata = {
  title: "Contact",
}

export default function ContactPage() {
  return (
    <div>
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Let’s talk about your product, launch, or listing.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              {siteContent.contact.intro}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Reach the team</h2>
            <p className="text-base leading-7 text-muted-foreground">
              Use the form or the contact details below for submissions, listing
              updates, corrections, and general questions.
            </p>
            <div className="grid gap-4">
              {siteContent.contact.channels.map((channel) => (
                <div key={channel.title} className="rounded-xl border bg-card p-5">
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {channel.title}
                  </div>
                  {channel.href ? (
                    <a href={channel.href} className="mt-2 block text-lg font-semibold">
                      {channel.value}
                    </a>
                  ) : (
                    <div className="mt-2 text-lg font-semibold">{channel.value}</div>
                  )}
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <ContactForm fields={siteContent.contact.fields} />
        </div>
      </section>
    </div>
  )
}
