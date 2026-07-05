import { z } from 'zod'

import { PromiseQueue } from '../lib/queue'
import type { UonLead, UonStatus } from '../types'
export type { UonLead }

import { fetchJson } from './client'
import { API_CONFIG } from './config'

const UON_PAGE_SIZE = 100
const NON_QUALIFIED_STATUS_IDS = new Set([6, 7, 9, 10, 15, 16, 17, 18, 19])

const uonQueue = new PromiseQueue(5)

const uonLeadSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  id_system: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  dat: z.string(),
  dat_lead: z.string().nullable(),
  dat_close: z.string().nullable(),
  dat_updated: z.string().nullable(),
  status_id: z.union([z.number(), z.string()]).transform((v) => String(v)),
  status: z.string().nullable().transform((v) => v ?? '').default(''),
  source_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  source: z.string().nullable().transform((v) => v ?? '').default(''),
  manager_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  manager_name: z.string().nullable().transform((v) => v ?? '').default(''),
  manager_surname: z.string().nullable().transform((v) => v ?? '').default(''),
  client_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  client_name: z.string().nullable().transform((v) => v ?? '').default(''),
  client_phone: z.string().nullable().transform((v) => v ?? '').default(''),
  client_phone_mobile: z.string().nullable().transform((v) => v ?? '').default(''),
  client_email: z.string().nullable().transform((v) => v ?? '').default(''),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  utm_content: z.string().nullable(),
  utm_term: z.string().nullable(),
  calc_price: z.union([z.number(), z.string()]).nullable().transform((v) => Number(v ?? 0)).default(0),
  calc_price_netto: z.union([z.number(), z.string()]).nullable().transform((v) => Number(v ?? 0)).default(0),
  calc_increase: z.union([z.number(), z.string()]).nullable().transform((v) => Number(v ?? 0)).default(0),
  calc_decrease: z.union([z.number(), z.string()]).nullable().transform((v) => Number(v ?? 0)).default(0),
  notes: z.string().nullable().transform((v) => v ?? '').default(''),
  services: z.array(z.unknown()).default([]),
  extended_fields: z.array(z.unknown()).default([]),
})

const uonLeadsResponseSchema = z.object({
  leads: z.array(uonLeadSchema).default([]),
})

const uonStatusSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  name: z.string(),
  ord: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  is_archive: z.union([z.number(), z.string()]).transform((v) => Number(v)),
})

const uonStatusesResponseSchema = z.object({
  records: z.array(uonStatusSchema).default([]),
})

function buildUrl(apiKey: string, path: string): string {
  return `${API_CONFIG.uon.baseUrl}/${apiKey}${path}`
}

export async function getUonStatuses(apiKey: string): Promise<UonStatus[]> {
  return uonQueue.add(async () => {
    const data = await fetchJson<unknown>(
      buildUrl(apiKey, '/status_lead.json'),
      {},
      'Статусы обращений U-ON'
    )
    const parsed = uonStatusesResponseSchema.parse(data)
    return parsed.records
  })
}

export async function getUonLeads(
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<UonLead[]> {
  const allLeads: UonLead[] = []
  let page = 1

  while (true) {
    const data = await uonQueue.add(async () => {
      const url = buildUrl(apiKey, `/leads/${dateFrom}/${dateTo}/${page}.json`)
      return fetchJson<unknown>(url, {}, `Обращения U-ON (стр. ${page})`)
    })

    const parsed = uonLeadsResponseSchema.parse(data)
    allLeads.push(...parsed.leads)

    if (parsed.leads.length < UON_PAGE_SIZE) break
    page += 1
  }

  return allLeads
}

export function isQualifiedLead(lead: UonLead): boolean {
  return !NON_QUALIFIED_STATUS_IDS.has(Number(lead.status_id))
}

export function getQualifiedLeads(leads: UonLead[]): UonLead[] {
  return leads.filter(isQualifiedLead)
}
