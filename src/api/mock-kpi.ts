import { ClientKpi } from '../types/kpi.types';

export const MOCK_CLIENTS: ClientKpi[] = [
  {
    id: 'client-1',
    name: 'Клиент А (Пример из дока)',
    kpi: {
      cost: 200000,
      leads: 120,
      cpl: 2500,
    },
    weeklyFacts: [
      {
        week: '1-7 июня',
        impressions: 45000,
        clicks: 3000,
        ctr: 6.6,
        cost: 45000,
        avgCpc: 15,
        leads: 25,
        conversionRate: 0.8,
        cpl: 1800,
      },
      {
        week: '8-14 июня',
        impressions: 50000,
        clicks: 3500,
        ctr: 7.0,
        cost: 55000,
        avgCpc: 15.7,
        leads: 30,
        conversionRate: 0.85,
        cpl: 1833,
      },
      {
        week: '15-21 июня',
        impressions: 48000,
        clicks: 3200,
        ctr: 6.6,
        cost: 80000,
        avgCpc: 25,
        leads: 35,
        conversionRate: 1.09,
        cpl: 2285,
      },
      {
        week: '22-30 июня',
        impressions: 40000,
        clicks: 2500,
        ctr: 6.2,
        cost: 180000, // Accumulated sum to match doc example: total 180,000, wait, it says "Факт расхода 180 000, KPI 200 000". Let's assume this is the last week sum or total.
        avgCpc: 72,
        leads: 90, // accumulated facts to match doc
        conversionRate: 3.6,
        cpl: 3000, // over KPI
      }
    ],
    campaigns: [
      {
        id: 'camp-1',
        name: 'Поиск | Услуги',
        cost: 150000,
        leads: 80,
        cpl: 1875,
        clicks: 2000,
        ctr: 10.5,
        conversionRate: 4.0,
      },
      {
        id: 'camp-2',
        name: 'РСЯ | Ретаргет',
        cost: 30000,
        leads: 10,
        cpl: 3000, // expensive
        clicks: 500,
        ctr: 0.8,
        conversionRate: 2.0,
      }
    ]
  },
  {
    id: 'client-2',
    name: 'Клиент Б (Отличник)',
    kpi: {
      cost: 150000,
      leads: 150,
      cpl: 1000,
    },
    weeklyFacts: [
      {
        week: 'Июнь (Итог)',
        impressions: 120000,
        clicks: 10000,
        ctr: 8.3,
        cost: 140000,
        avgCpc: 14,
        leads: 160,
        conversionRate: 1.6,
        cpl: 875,
      }
    ],
    campaigns: []
  },
  {
    id: 'client-3',
    name: 'Клиент В (Риск)',
    kpi: {
      cost: 100000,
      leads: 50,
      cpl: 2000,
    },
    weeklyFacts: [
      {
        week: 'Июнь (Итог)',
        impressions: 60000,
        clicks: 2000,
        ctr: 3.3,
        cost: 95000,
        avgCpc: 47.5,
        leads: 46, // -8% dev (yellow)
        conversionRate: 2.3,
        cpl: 2065, // +3% dev (yellow)
      }
    ],
    campaigns: []
  }
];

export async function fetchClientsKpi(): Promise<ClientKpi[]> {
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLIENTS), 500));
}
