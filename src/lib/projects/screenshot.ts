import { chromium as playwrightChromium } from "playwright"
import { chromium as playwrightCoreChromium } from "playwright-core"
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
  if (env.NODE_ENV === "production") {
    const executablePath = await chromium.executablePath()

    return playwrightCoreChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    })
  }

  return playwrightChromium.launch({
    headless: true,
  })
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
