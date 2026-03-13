import { chromium as playwrightChromium } from "playwright"
import { chromium as playwrightCoreChromium } from "playwright-core"
import type { Browser } from "playwright-core"
import chromium from "@sparticuz/chromium"
import { UTApi, UTFile } from "uploadthing/server"

import { env } from "@/lib/env"

type UploadedScreenshot = {
  screenshotUrl: string
  screenshotFileKey: string
}

export async function captureAndUploadScreenshot({
  appUrl,
  slug,
}: {
  appUrl: string
  slug: string
}): Promise<UploadedScreenshot> {
  const screenshot = await captureScreenshot(appUrl)
  const screenshotBytes = Uint8Array.from(screenshot)
  const utapi = getUtApi()
  const upload = await utapi.uploadFiles(
    new UTFile([screenshotBytes], `${slug}.png`, {
      type: "image/png",
    })
  )

  if (upload.error || !upload.data) {
    throw new Error(upload.error?.message ?? "Unable to upload the generated screenshot.")
  }

  return {
    screenshotUrl: upload.data.ufsUrl,
    screenshotFileKey: upload.data.key,
  }
}

async function captureScreenshot(targetUrl: string) {
  const browser = await launchBrowser()

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1,
    })

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    })

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })

    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => null)
    await page.waitForTimeout(1_250)

    return await page.screenshot({
      type: "png",
      fullPage: false,
      animations: "disabled",
    })
  } finally {
    await browser.close()
  }
}

async function launchBrowser() {
  const attemptErrors: string[] = []

  for (const attempt of getBrowserLaunchAttempts()) {
    try {
      return await attempt.launch()
    } catch (error) {
      attemptErrors.push(formatLaunchError(attempt.name, error))
    }
  }

  throw new Error(
    [
      "Unable to launch Chromium for screenshot capture.",
      ...attemptErrors,
      "If this is Railway, prefer a standard Playwright Chromium install or set CHROMIUM_EXECUTABLE_PATH explicitly.",
    ].join(" "),
  )
}

function getBrowserLaunchAttempts(): Array<{
  name: string
  launch: () => Promise<Browser>
}> {
  const sharedArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ]
  const attempts: Array<{
    name: string
    launch: () => Promise<Browser>
  }> = []
  const explicitExecutablePath = process.env.CHROMIUM_EXECUTABLE_PATH?.trim()

  if (explicitExecutablePath) {
    attempts.push({
      name: "custom CHROMIUM_EXECUTABLE_PATH",
      launch: () =>
        playwrightCoreChromium.launch({
          executablePath: explicitExecutablePath,
          headless: true,
          chromiumSandbox: false,
          args: sharedArgs,
        }),
    })
  }

  attempts.push({
    name: env.NODE_ENV === "production" ? "Playwright bundled Chromium" : "Playwright local Chromium",
    launch: () =>
      playwrightChromium.launch({
        headless: true,
        chromiumSandbox: false,
        args: sharedArgs,
      }),
  })

  if (env.NODE_ENV === "production") {
    attempts.push({
      name: "Sparticuz serverless Chromium",
      launch: async () => {
        chromium.setGraphicsMode = false

        const executablePath = await chromium.executablePath()

        return playwrightCoreChromium.launch({
          executablePath,
          headless: true,
          chromiumSandbox: false,
          args: [...new Set([...chromium.args, ...sharedArgs])],
        })
      },
    })
  }

  return attempts
}

function formatLaunchError(name: string, error: unknown) {
  if (error instanceof Error) {
    return `${name} failed: ${error.message}`
  }

  return `${name} failed with a non-Error exception.`
}

function getUtApi() {
  if (env.UPLOADTHING_TOKEN) {
    return new UTApi({
      token: env.UPLOADTHING_TOKEN,
    })
  }

  throw new Error(
    "UploadThing is not configured. Set UPLOADTHING_TOKEN before processing screenshots."
  )
}
