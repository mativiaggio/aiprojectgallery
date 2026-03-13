This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

This repo includes a [`railway.toml`](/C:/Users/matia/side-projects/aiprojectgallery/railway.toml) tuned for a single web service plus Railway Postgres on the Free plan.

Minimum Railway variables for the web service:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
BETTER_AUTH_SECRET=replace-with-a-32-char-secret
BETTER_AUTH_URL=https://your-domain.up.railway.app
NEXT_PUBLIC_APP_URL=${{BETTER_AUTH_URL}}
RAILPACK_NODE_VERSION=20
NEXT_TELEMETRY_DISABLED=1
```

Optional lean-mode variables:

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL=
UPLOADTHING_TOKEN=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
GITHUB_TOKEN=
CRON_SECRET=
```

Deploy flow:

1. Create a Railway project with one web service and one Postgres service.
2. Set the variables above on the web service.
3. Deploy the repo. Railway will run `pnpm build`, then `pnpm db:generate && pnpm db:migrate`, and finally start the standalone Next server.
4. Add a Railway public domain or custom domain and make sure `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` point to the final HTTPS URL.
5. Keep `sleepApplication` enabled for the lowest idle footprint on Free.
