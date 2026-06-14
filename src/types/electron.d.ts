export interface ElectronAPI {
  onMainProcessMessage: (callback: (data: string) => void) => () => void
  openExternal: (url: string) => Promise<void>
  getToken: () => Promise<string | null>
  setToken: (token: string) => Promise<void>
  deleteToken: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
