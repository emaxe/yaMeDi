import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  onMainProcessMessage: (callback: (data: string) => void) =>
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
})
