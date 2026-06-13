import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, ipcMain, shell } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

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

async function createWindow() {
  console.log('[electron] Creating window...')
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Yandex Metrics Dashboard',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    console.log('[electron] Window loaded')
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('[electron] Failed to load:', errorCode, errorDescription)
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
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('open-external', async (_, url: string) => {
  await shell.openExternal(url)
})

app.whenReady().then(() => {
  console.log('[electron] App ready, platform:', process.platform)
  createWindow().catch((err) => {
    console.error('[electron] Failed to create window:', err)
  })
})
