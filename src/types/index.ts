import { z } from 'zod'

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

export const accountInfoSchema = z.object({
  login: z.string().optional(),
  id: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  default_email: z.string().optional(),
  scope: z.union([z.string(), z.array(z.string())]).optional(),
})

export const directApiErrorSchema = z.object({
  error: z.object({
    error_code: z.union([z.string(), z.number()]).optional(),
    error_string: z.string().optional(),
  }).optional(),
})

export interface Counter {
  id: number
  name: string
  site: string
  status: string
  type?: string
}

export const counterSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  site: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
})

export const countersResponseSchema = z.object({
  counters: z.array(counterSchema).default([]),
})

export interface MetricaRow {
  dimensions: Array<{ name: string; id?: string }>
  metrics: number[]
}

export const metricaRowSchema = z.object({
  dimensions: z.array(z.object({ name: z.string(), id: z.string().optional() })),
  metrics: z.array(z.number()),
})

export interface MetricaData {
  query: {
    metrics: string[]
    dimensions: string[]
  }
  data: MetricaRow[]
  totals: number[]
}

export const metricaDataSchema = z.object({
  query: z.object({
    metrics: z.array(z.string()),
    dimensions: z.array(z.string()),
  }),
  data: z.array(metricaRowSchema),
  totals: z.array(z.number()),
})

export interface Campaign {
  Id: number
  Name: string
  Status: string
  Type: string
  State: string
  Currency: string
}

export const campaignSchema = z.object({
  Id: z.number(),
  Name: z.string(),
  Status: z.string(),
  Type: z.string(),
  State: z.string(),
  Currency: z.string(),
})

export const campaignsResponseSchema = z.object({
  result: z
    .object({
      Campaigns: z.array(campaignSchema).default([]),
    })
    .optional(),
})

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

export const directReportRowSchema = z.object({
  CampaignName: z.string(),
  CampaignId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)),
  Impressions: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
  Clicks: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
  Cost: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
  Ctr: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
  AvgCpc: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
  Conversions: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseFloat(v) : v)),
})

export interface NavItem {
  id: string
  label: string
  icon: string
}

export type ChartDataPoint = {
  date?: string
  name?: string
  [metric: string]: string | number | undefined
}

export type ComparisonPoint = {
  current: ChartDataPoint
  previous: ChartDataPoint
}

export type WidgetData = {
  data: ChartDataPoint[]
  totals: number[]
  metrics: string[]
  dimensions: string[]
}
