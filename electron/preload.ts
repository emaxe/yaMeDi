import { ipcRenderer, contextBridge } from 'electron'

import type { ElectronAPI } from '../src/types/electron'

const electronAPI: ElectronAPI = {
  onMainProcessMessage: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => callback(value)
    ipcRenderer.on('main-process-message', listener)
    return () => ipcRenderer.removeListener('main-process-message', listener)
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getToken: () => ipcRenderer.invoke('secure-store:get-token'),
  setToken: (token) => ipcRenderer.invoke('secure-store:set-token', token),
  deleteToken: () => ipcRenderer.invoke('secure-store:delete-token'),
  directFetch: (url, options) => ipcRenderer.invoke('direct:fetch', url, options),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
