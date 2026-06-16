import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/mobile-token.png', fullPage: false })

  await page.locator('button:visible', { hasText: 'Счётчики' }).first().click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/mobile-counters.png', fullPage: false })

  // Desktop view
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/desktop-token.png', fullPage: false })

  await page.locator('button:visible', { hasText: 'Счётчики' }).first().click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/desktop-counters.png', fullPage: false })

  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
