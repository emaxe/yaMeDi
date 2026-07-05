import { describe, expect, it, vi } from 'vitest'

import type { UonLead } from '../types'

import { getQualifiedLeads, getUonLeads, isQualifiedLead } from './uon'
import { fetchJson } from './client'

vi.mock('./client', () => ({
  fetchJson: vi.fn(),
}))

vi.mock('./config', () => ({
  API_CONFIG: {
    uon: { baseUrl: 'https://api.u-on.ru' },
  },
}))

function createLead(overrides: Partial<UonLead> = {}): UonLead {
  return {
    id: 1,
    id_system: 1,
    dat: '2026-05-01 10:00',
    dat_lead: '2026-05-01 10:00',
    dat_close: null,
    dat_updated: null,
    status_id: '1',
    status: 'Новый',
    source_id: 2,
    source: 'Заявка с сайта',
    manager_id: 100,
    manager_name: 'Тест',
    manager_surname: 'Тест',
    client_id: 200,
    client_name: 'Клиент',
    client_phone: '',
    client_phone_mobile: '',
    client_email: '',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    calc_price: 0,
    calc_price_netto: 0,
    calc_increase: 0,
    calc_decrease: 0,
    notes: '',
    services: [],
    extended_fields: [],
    ...overrides,
  }
}

describe('isQualifiedLead', () => {
  it('returns true for non-archived status', () => {
    expect(isQualifiedLead(createLead({ status_id: '1', status: 'Новый' }))).toBe(true)
    expect(isQualifiedLead(createLead({ status_id: '2', status: 'Думает над предложением' }))).toBe(true)
    expect(isQualifiedLead(createLead({ status_id: '20', status: 'Определяется с датами' }))).toBe(true)
  })

  it('returns false for archived (non-qualified) statuses', () => {
    expect(isQualifiedLead(createLead({ status_id: '7', status: 'Отвалился' }))).toBe(false)
    expect(isQualifiedLead(createLead({ status_id: '9', status: 'Пустой' }))).toBe(false)
    expect(isQualifiedLead(createLead({ status_id: '15', status: 'НЕ ВЫШЕЛ НА СВЯЗЬ' }))).toBe(false)
    expect(isQualifiedLead(createLead({ status_id: '16', status: 'СПАМ / НЕПРАВИЛЬНЫЙ НОМЕР' }))).toBe(false)
  })
})

describe('getQualifiedLeads', () => {
  it('filters out non-qualified leads', () => {
    const leads = [
      createLead({ id: 1, status_id: '1' }),
      createLead({ id: 2, status_id: '7' }),
      createLead({ id: 3, status_id: '2' }),
      createLead({ id: 4, status_id: '9' }),
      createLead({ id: 5, status_id: '15' }),
    ]

    const qualified = getQualifiedLeads(leads)
    expect(qualified).toHaveLength(2)
    expect(qualified.map((l) => l.id)).toEqual([1, 3])
  })

  it('returns all leads when all are qualified', () => {
    const leads = [
      createLead({ id: 1, status_id: '1' }),
      createLead({ id: 2, status_id: '2' }),
    ]

    const qualified = getQualifiedLeads(leads)
    expect(qualified).toHaveLength(2)
  })

  it('returns empty array when all leads are non-qualified', () => {
    const leads = [
      createLead({ id: 1, status_id: '7' }),
      createLead({ id: 2, status_id: '9' }),
    ]

    const qualified = getQualifiedLeads(leads)
    expect(qualified).toHaveLength(0)
  })
})

describe('getUonLeads schema parsing', () => {
  it('handles null values for calc_* and manager/client string fields', async () => {
    const mockFetchJson = vi.mocked(fetchJson)
    mockFetchJson.mockResolvedValueOnce({
      leads: [
        {
          id: 1,
          id_system: 1,
          dat: '2026-05-01 10:00',
          dat_lead: null,
          dat_close: null,
          dat_updated: null,
          status_id: '1',
          status: null,
          source_id: 2,
          source: null,
          manager_id: 100,
          manager_name: null,
          manager_surname: null,
          client_id: 200,
          client_name: null,
          client_phone: null,
          client_phone_mobile: null,
          client_email: null,
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          utm_content: null,
          utm_term: null,
          calc_price: null,
          calc_price_netto: null,
          calc_increase: null,
          calc_decrease: null,
          notes: '',
          services: [],
          extended_fields: [],
        },
      ],
    })

    const leads = await getUonLeads('fake-key', '2026-05-01', '2026-05-31')

    expect(leads).toHaveLength(1)
    const lead = leads[0]
    expect(lead.manager_name).toBe('')
    expect(lead.manager_surname).toBe('')
    expect(lead.client_phone).toBe('')
    expect(lead.client_name).toBe('')
    expect(lead.source).toBe('')
    expect(lead.status).toBe('')
    expect(lead.client_phone_mobile).toBe('')
    expect(lead.client_email).toBe('')
    expect(lead.calc_price).toBe(0)
    expect(lead.calc_price_netto).toBe(0)
    expect(lead.calc_increase).toBe(0)
    expect(lead.calc_decrease).toBe(0)
  })
})
