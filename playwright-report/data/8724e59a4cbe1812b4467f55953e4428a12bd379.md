# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Electron app >> navigates through sidebar tabs
- Location: e2e/app.spec.ts:23:3

# Error details

```
TimeoutError: page.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('text=Диагностика')

```

# Test source

```ts
  1  | import path from 'node:path'
  2  | import { fileURLToPath } from 'node:url'
  3  | 
  4  | import { test, expect, _electron as electron } from '@playwright/test'
  5  | 
  6  | const __dirname = path.dirname(fileURLToPath(import.meta.url))
  7  | const executablePath = path.resolve(
  8  |   __dirname,
  9  |   '../dist/mac/Yandex Metrics Dashboard.app/Contents/MacOS/Yandex Metrics Dashboard'
  10 | )
  11 | 
  12 | test.describe('Electron app', () => {
  13 |   test('opens with token setup screen', async () => {
  14 |     const electronApp = await electron.launch({ executablePath })
  15 |     const window = await electronApp.firstWindow()
  16 | 
  17 |     await expect(window.locator('text=Настройка OAuth-токена')).toBeVisible()
  18 |     await expect(window.locator('text=Yandex Dashboard')).toBeVisible()
  19 | 
  20 |     await electronApp.close()
  21 |   })
  22 | 
  23 |   test('navigates through sidebar tabs', async () => {
  24 |     const electronApp = await electron.launch({ executablePath })
  25 |     const window = await electronApp.firstWindow()
  26 | 
> 27 |     await window.click('text=Диагностика')
     |                  ^ TimeoutError: page.click: Timeout 30000ms exceeded.
  28 |     await expect(window.locator('text=Диагностика токена')).toBeVisible()
  29 | 
  30 |     await window.click('text=Счётчики')
  31 |     await expect(window.locator('text=Счётчики Метрики')).toBeVisible()
  32 | 
  33 |     await electronApp.close()
  34 |   })
  35 | 
  36 |   test('opens metrics dashboard tab with empty state', async () => {
  37 |     const electronApp = await electron.launch({ executablePath })
  38 |     const window = await electronApp.firstWindow()
  39 | 
  40 |     await window.click('text=Графики')
  41 |     await expect(window.locator('text=Графики Метрики')).toBeVisible()
  42 |     await expect(window.locator('text=Сначала выберите счётчик')).toBeVisible()
  43 | 
  44 |     await electronApp.close()
  45 |   })
  46 | })
  47 | 
```