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
  dimensions: Array<{ name: string | null; id?: string | null }>
  metrics: number[]
}

export const metricaRowSchema = z.object({
  dimensions: z.array(
    z.object({ name: z.string().nullable(), id: z.string().nullable().optional() })
  ),
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
  directFullReason?: string
  directReadReason?: string
  account?: AccountInfo
}

export interface DateRange {
  from: string
  to: string
}

export const numericFieldSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? parseFloat(v) : v))

export interface CampaignPerformanceReportRow {
  Date: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  AvgCpc: number
  Conversions: number
  CampaignId?: number
  CampaignName?: string
}

export const campaignPerformanceReportRowSchema = z.object({
  Date: z.string(),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
  AvgCpc: numericFieldSchema,
  Conversions: numericFieldSchema,
  CampaignId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)).optional(),
  CampaignName: z.string().optional(),
})

export interface AdReportRow {
  AdId: number
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  CampaignId?: number
  CampaignName?: string
}

export const adReportRowSchema = z.object({
  AdId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
  CampaignId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)).optional(),
  CampaignName: z.string().optional(),
})

export interface SearchTermReportRow {
  Query: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  CampaignId?: number
  CampaignName?: string
}

export const searchTermReportRowSchema = z.object({
  Query: z.string(),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
  CampaignId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)).optional(),
  CampaignName: z.string().optional(),
})

/** @deprecated use campaignPerformanceReportRowSchema */
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

/** @deprecated use campaignPerformanceReportRowSchema */
export const directReportRowSchema = z.object({
  CampaignName: z.string(),
  CampaignId: z.union([z.string(), z.number()]).transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
  AvgCpc: numericFieldSchema,
  Conversions: numericFieldSchema,
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

export interface OperationalProjectConfig {
  id: string
  name: string
  counterId: number
  directClientLogin: string
  /** Имя метрики покупок в Метрике. По умолчанию 'ym:s:ecommercePurchases'. */
  purchasesMetric: string
  /** Имя метрики добавления в корзину. По умолчанию 'ym:s:ecommerceAddToCart'. */
  addToCartMetric: string
  /** ID цели «Добавлено в корзину». Если задан вместе с orderGoalId, C1–C3 строятся единообразно на целях. */
  cartGoalId?: number
  /** ID цели «Оформлен заказ». Если задан вместе с cartGoalId, C1–C3 строятся единообразно на целях. */
  orderGoalId?: number
  /** ID цели «Собрано контактов». */
  contactGoalId?: number
  /** Дополнительные рекламные кабинеты, расходы которых суммируются в строку «Бюджет». */
  extraAdCosts?: { name: string; clientLogin: string }[]
}

export const operationalProjectConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  counterId: z.number(),
  directClientLogin: z.string(),
  purchasesMetric: z.string().default('ym:s:ecommercePurchases'),
  addToCartMetric: z.string().default('ym:s:ecommerceAddToCart'),
  cartGoalId: z.number().optional(),
  orderGoalId: z.number().optional(),
  contactGoalId: z.number().optional(),
  extraAdCosts: z.array(z.object({ name: z.string(), clientLogin: z.string() })).optional(),
})
