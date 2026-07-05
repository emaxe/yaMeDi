import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, ipcMain, safeStorage, session, shell } from 'electron'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

interface SecureStoreSchema {
  encryptedToken?: string
  encryptedClientLogin?: string
}

interface AuditStoreSchema {
  items?: Array<{
    id: string
    label: string
    lastCheckedDate: string | null
    status: string
    intervalDays: number
  }>
}

interface DirectFetchOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

const DIRECT_FETCH_TIMEOUT = 10000
const UON_FETCH_TIMEOUT = 30000

const secureStore = new Store<SecureStoreSchema>({ name: 'yandex-metrics-auth' })
const auditStore = new Store<AuditStoreSchema>({ name: 'yandex-metrics-audit' })

const TRUSTED_EXTERNAL_DOMAINS = new Set([
  'oauth.yandex.ru',
  'login.yandex.ru',
  'api-metrika.yandex.net',
  'api.direct.yandex.com',
  'api-sandbox.direct.yandex.com',
  'api.u-on.ru',
])

const CSP_VALUE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://oauth.yandex.ru https://login.yandex.ru https://api-metrika.yandex.net https://api.direct.yandex.com https://api-sandbox.direct.yandex.com https://api.u-on.ru ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function isTrustedExternalUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'https:') return false
    return TRUSTED_EXTERNAL_DOMAINS.has(url.hostname)
  } catch {
    return false
  }
}

function isAllowedNavigationUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol === 'file:') return true
    if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return true
    }
    return false
  } catch {
    return false
  }
}

function checkDevServer(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

function resolvePreloadPath(): string {
  const candidates = [
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, '../dist-electron/preload.mjs'),
    path.join(__dirname, '../dist-electron/preload.cjs'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log('[electron] preload resolved:', candidate)
      return candidate
    }
  }
  console.error('[electron] preload not found in candidates:', candidates)
  return candidates[0]
}

async function createWindow() {
  console.log('[electron] Creating window... __dirname=', __dirname)
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Yandex Metrics Dashboard',
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  win.webContents.on('did-finish-load', () => {
    console.log('[electron] Window loaded')
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('[electron] Failed to load:', errorCode, errorDescription)
  })

  win.webContents.on('preload-error', (_, preloadPath, error) => {
    console.error('[electron] Preload error:', preloadPath, error)
  })

  win.webContents.on('console-message', (_, level, message, line, sourceId) => {
    const label = level === 0 ? 'VERBOSE' : level === 1 ? 'INFO' : level === 2 ? 'WARN' : 'ERROR'
    console.log(`[renderer:${label}] ${sourceId}:${line}`, message)
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigationUrl(url)) {
      console.warn('[electron] Blocked navigation to:', url)
      event.preventDefault()
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedExternalUrl(url)) {
      shell.openExternal(url).catch((err) => {
        console.error('[electron] Failed to open external URL:', err)
      })
    } else {
      console.warn('[electron] Blocked new window for:', url)
    }
    return { action: 'deny' }
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  console.log('[electron] VITE_DEV_SERVER_URL:', devUrl)

  if (devUrl) {
    console.log('[electron] Loading dev URL:', devUrl)
    await win.loadURL(devUrl)
    return
  }

  const candidates = [
    'http://localhost:5173/',
    'http://localhost:5174/',
    'http://localhost:5175/',
  ]

  for (const url of candidates) {
    console.log('[electron] Checking dev server:', url)
    if (await checkDevServer(url)) {
      console.log('[electron] Dev server found at', url)
      await win.loadURL(url)
      return
    }
  }

  const indexPath = path.join(process.env.DIST!, 'index.html')
  console.log('[electron] Loading file:', indexPath)
  await win.loadFile(indexPath)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function encryptToken(token: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Шифрование безопасного хранилища недоступно')
  }
  return safeStorage.encryptString(token).toString('base64')
}

function decryptToken(encrypted: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Шифрование безопасного хранилища недоступно')
  }
  return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
}

ipcMain.handle('open-external', async (_, url: string) => {
  if (!isTrustedExternalUrl(url)) {
    throw new Error(`Blocked: ${url} is not a trusted external URL`)
  }
  await shell.openExternal(url)
})

ipcMain.handle('secure-store:get-token', () => {
  const encrypted = secureStore.get('encryptedToken')
  if (!encrypted) return null
  try {
    return decryptToken(encrypted)
  } catch (err) {
    console.error('[secure-store] Failed to decrypt token:', err)
    secureStore.delete('encryptedToken')
    return null
  }
})

ipcMain.handle('secure-store:set-token', (_, token: string) => {
  secureStore.set('encryptedToken', encryptToken(token))
})

ipcMain.handle('secure-store:delete-token', () => {
  secureStore.delete('encryptedToken')
})

ipcMain.handle('secure-store:get-client-login', () => {
  const encrypted = secureStore.get('encryptedClientLogin')
  if (!encrypted) return null
  try {
    return decryptToken(encrypted)
  } catch (err) {
    console.error('[secure-store] Failed to decrypt client login:', err)
    secureStore.delete('encryptedClientLogin')
    return null
  }
})

ipcMain.handle('secure-store:set-client-login', (_, clientLogin: string) => {
  secureStore.set('encryptedClientLogin', encryptToken(clientLogin))
})

ipcMain.handle('secure-store:delete-client-login', () => {
  secureStore.delete('encryptedClientLogin')
})

ipcMain.handle('audit:get', () => {
  return auditStore.get('items', [])
})

ipcMain.handle('audit:set', (_, items: AuditStoreSchema['items']) => {
  auditStore.set('items', items)
})

ipcMain.handle('direct:fetch', async (_, url: string, options: DirectFetchOptions) => {
  console.log('[direct:fetch] ipc called', url, options.method ?? 'GET')
  console.log('[direct:fetch] headers', options.headers)
  if (!isTrustedExternalUrl(url)) {
    console.error('[direct:fetch] blocked untrusted URL', url)
    throw new Error(`Blocked direct fetch to untrusted URL: ${url}`)
  }

  const timeout = options.timeout ?? DIRECT_FETCH_TIMEOUT
  const signal = AbortSignal.timeout(timeout)

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    })
    const body = await response.text()
    console.log('[direct:fetch] response', response.status, body.slice(0, 200))
    return { status: response.status, body }
  } catch (err) {
    console.error('[direct:fetch] Network error:', err)
    throw err
  }
})

ipcMain.handle('uon:fetch', async (_, url: string, options: DirectFetchOptions) => {
  if (!isTrustedExternalUrl(url)) {
    throw new Error(`Blocked uon fetch to untrusted URL: ${url}`)
  }

  const timeout = options.timeout ?? UON_FETCH_TIMEOUT
  const signal = AbortSignal.timeout(timeout)

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    })
    const body = await response.text()
    return { status: response.status, body }
  } catch (err) {
    console.error('[uon:fetch] Network error:', err)
    throw err
  }
})

process.on('uncaughtException', (err) => {
  console.error('[electron] Uncaught exception:', err)
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  console.error('[electron] Unhandled rejection:', reason)
  app.quit()
})

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP_VALUE],
      },
    })
  })

  console.log('[electron] App ready, platform:', process.platform)
  createWindow().catch((err) => {
    console.error('[electron] Failed to create window:', err)
  })

  if (app.isPackaged) {
    autoUpdater
      .checkForUpdatesAndNotify()
      .catch((err) => console.error('[autoUpdater] Failed to check for updates:', err))
  }
})
