import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { test, expect, _electron as electron } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const executablePath = path.resolve(
  __dirname,
  '../dist/mac/yandex-metrics-app.app/Contents/MacOS/yandex-metrics-app'
)

test.describe('Electron app', () => {
  test('opens with token setup screen', async () => {
    const electronApp = await electron.launch({ executablePath })
    const window = await electronApp.firstWindow()

    await expect(window.locator('text=Настройка OAuth-токена')).toBeVisible()
    await expect(window.locator('text=Yandex Dashboard')).toBeVisible()

    await electronApp.close()
  })

  test('navigates through sidebar tabs', async () => {
    const electronApp = await electron.launch({ executablePath })
    const window = await electronApp.firstWindow()

    await window.click('text=Диагностика')
    await expect(window.locator('text=Диагностика токена')).toBeVisible()

    await window.click('text=Счётчики')
    await expect(window.locator('text=Счётчики Метрики')).toBeVisible()

    await electronApp.close()
  })
})
