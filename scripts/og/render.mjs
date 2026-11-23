// Run: node scripts/og/render.mjs (needs the playwright package; writes landing/public/og.png).
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = pathToFileURL(resolve(here, 'og.html')).href
const output = resolve(here, '../../landing/public/og.png')

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(source)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: output, clip: { x: 0, y: 0, width: 1200, height: 630 } })
} finally {
  await browser.close()
}
console.log(`wrote ${output}`)
