export interface AccountInfo {
  valid: boolean
  login?: string
  id?: string
  first_name?: string
  last_name?: string
  default_email?: string
  scope?: string | string[]
  error?: string
}

export interface Counter {
  id: number
  name: string
  site: string
  status: string
  type?: string
}

export interface MetricaData {
  query: {
    metrics: string[]
    dimensions: string[]
  }
  data: MetricaRow[]
  totals: number[]
}

export interface MetricaRow {
  dimensions: Array<{ name: string; id?: string }>
  metrics: number[]
}

export interface Campaign {
  Id: number
  Name: string
  Status: string
  Type: string
  State: string
  Currency: string
}

export interface TokenCheckResult {
  valid: boolean
  metrica: boolean
  directFull: boolean
  directRead: boolean
  account?: AccountInfo
}

export interface DateRange {
  from: string
  to: string
}

export interface DirectReportRow {
  CampaignName: string
  CampaignId: number
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  AvgCpc: number
  Conversions: number
}

export interface NavItem {
  id: string
  label: string
  icon: string
}
