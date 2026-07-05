import type { AuditChecklistItem } from '../types'

export interface DirectFetchOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface DirectFetchResponse {
  status: number
  body: string
}

export interface ElectronAPI {
  onMainProcessMessage: (callback: (data: string) => void) => () => void
  openExternal: (url: string) => Promise<void>
  getToken: () => Promise<string | null>
  setToken: (token: string) => Promise<void>
  deleteToken: () => Promise<void>
  getClientLogin: () => Promise<string | null>
  setClientLogin: (clientLogin: string) => Promise<void>
  deleteClientLogin: () => Promise<void>
  getAuditChecklist: () => Promise<AuditChecklistItem[] | null>
  setAuditChecklist: (items: AuditChecklistItem[]) => Promise<void>
  directFetch: (url: string, options: DirectFetchOptions) => Promise<DirectFetchResponse>
  uonFetch: (url: string, options: DirectFetchOptions) => Promise<DirectFetchResponse>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
