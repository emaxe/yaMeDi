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
  getClientLogin: () => ipcRenderer.invoke('secure-store:get-client-login'),
  setClientLogin: (clientLogin) => ipcRenderer.invoke('secure-store:set-client-login', clientLogin),
  deleteClientLogin: () => ipcRenderer.invoke('secure-store:delete-client-login'),
  getAuditChecklist: () => ipcRenderer.invoke('audit:get'),
  setAuditChecklist: (items) => ipcRenderer.invoke('audit:set', items),
  directFetch: (url, options) => {
    console.log('[preload] directFetch options', options)
    return ipcRenderer.invoke('direct:fetch', url, options)
  },
  uonFetch: (url, options) => ipcRenderer.invoke('uon:fetch', url, options),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
