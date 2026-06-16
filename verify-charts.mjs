import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const executablePath = path.resolve(
  __dirname,
  'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
)

const electronApp = await electron.launch({
  executablePath,
  args: ['.'],
  cwd: __dirname,
})

const window = await electronApp.firstWindow()
await window.waitForLoadState('networkidle')

await window.click('text=Счётчики')
await window.waitForTimeout(2000)

const counter = window.locator('button:has-text("bukovaya-roscha.ru")').first()
await counter.waitFor({ state: 'visible' })
await counter.click()
await window.waitForTimeout(2000)

await window.click('text=Графики')
await window.waitForTimeout(3000)

await window.screenshot({ path: path.join(__dirname, 'verify-charts-top.png'), fullPage: false })

// Scroll through the page and capture sections
for (let i = 0; i < 6; i++) {
  await window.screenshot({ path: path.join(__dirname, `verify-charts-section-${i}.png`), fullPage: false })
  await window.evaluate(() => {
    const main = document.querySelector('main')
    if (main) main.scrollBy(0, 600)
  })
  await window.waitForTimeout(1000)
}

await window.screenshot({ path: path.join(__dirname, 'verify-charts-bottom.png'), fullPage: false })

await electronApp.close()
