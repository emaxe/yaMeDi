# Общая аналитика Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить вкладку «Общая аналитика», которая показывает агрегированные KPI, динамику, сводку по кампаниям и детальные отчёты по всем кампаниям Директа сразу.

**Architecture:** Существующие виджеты аналитики кампании рефакторятся в универсальные компоненты, принимающие `campaignId: number | 'all'`. Для `'all'` добавляются новые API-функции Direct Reports без фильтра по кампании. Новый компонент `OverallAnalytics` собирает дашборд из этих виджетов и новой сводной таблицы.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Recharts, React Query, Zod, Vitest, Playwright.

---

## File Structure

- `src/types/index.ts` — опциональные поля `CampaignId`/`CampaignName` в типах отчётов и Zod-схемах.
- `src/api/direct.ts` — новые функции `getOverallCampaignReport`, `getOverallAdReport`, `getOverallSearchTermsReport`.
- `src/hooks/useCampaignReports.ts` — хуки принимают `campaignId: number | 'all'`.
- `src/components/campaign-analytics/KpiCards.tsx` — рефакторинг `CampaignKpiCards`.
- `src/components/campaign-analytics/TrendChart.tsx` — рефакторинг `CampaignTrendChart`.
- `src/components/campaign-analytics/AdsReport.tsx` — рефакторинг `CampaignAdsReport`.
- `src/components/campaign-analytics/SearchTermsReport.tsx` — рефакторинг `CampaignSearchTermsReport`.
- `src/components/campaign-analytics/CampaignSummaryTable.tsx` — новая сводная таблица по кампаниям.
- `src/components/OverallAnalytics.tsx` — новый корневой компонент вкладки.
- `src/lib/navigation.ts` — новый пункт навигации.
- `src/App.tsx` — ленивая загрузка `OverallAnalytics`.
- `src/components/CampaignAnalytics.tsx` — обновление импортов.
- `src/components/ui/DataTable.tsx` — опциональная функция форматирования в столбце.
- `src/api/direct.test.ts` — тесты для новых API-функций.
- `src/hooks/useCampaignReports.test.tsx` — тесты для `'all'`.
- `src/components/campaign-analytics/KpiCards.test.tsx` — переименование/обновление.
- `src/components/campaign-analytics/TrendChart.test.tsx` — переименование/обновление.
- `src/components/campaign-analytics/AdsReport.test.tsx` — переименование/обновление.
- `src/components/campaign-analytics/SearchTermsReport.test.tsx` — переименование/обновление.
- `src/components/campaign-analytics/CampaignSummaryTable.test.tsx` — новый.
- `src/components/OverallAnalytics.test.tsx` — новый.

---

### Task 1: Extend report types and Zod schemas

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add optional campaign fields to `CampaignPerformanceReportRow` and schema**

```typescript
export interface CampaignPerformanceReportRow {
  Date: string
  CampaignId?: number
  CampaignName?: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  AvgCpc: number
  Conversions: number
}

export const campaignPerformanceReportRowSchema = z.object({
  Date: z.string(),
  CampaignId: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v))
    .optional(),
  CampaignName: z.string().optional(),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
  AvgCpc: numericFieldSchema,
  Conversions: numericFieldSchema,
})
```

- [ ] **Step 2: Add optional campaign fields to `AdReportRow` and schema**

```typescript
export interface AdReportRow {
  AdId: number
  CampaignId?: number
  CampaignName?: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
}

export const adReportRowSchema = z.object({
  AdId: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)),
  CampaignId: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v))
    .optional(),
  CampaignName: z.string().optional(),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
})
```

- [ ] **Step 3: Add optional campaign fields to `SearchTermReportRow` and schema**

```typescript
export interface SearchTermReportRow {
  Query: string
  CampaignId?: number
  CampaignName?: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
}

export const searchTermReportRowSchema = z.object({
  Query: z.string(),
  CampaignId: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v))
    .optional(),
  CampaignName: z.string().optional(),
  Impressions: numericFieldSchema,
  Clicks: numericFieldSchema,
  Cost: numericFieldSchema,
  Ctr: numericFieldSchema,
})
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts
git commit -m "types(overall-analytics): add optional CampaignId/CampaignName to report rows"
```

---

### Task 2: Add overall campaign report API

**Files:**
- Modify: `src/api/direct.ts`
- Modify: `src/api/direct.test.ts`

- [ ] **Step 1: Write failing test in `src/api/direct.test.ts`**

```typescript
import { getOverallCampaignReport } from './direct'

// inside describe block:
describe('getOverallCampaignReport', () => {
  it('returns parsed rows without CampaignId filter and includes campaign details', async () => {
    const tsv = 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch(textResponse(tsv))

    const rows = await getOverallCampaignReport(TOKEN, LOGIN, '2024-01-01', '2024-01-31')
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
        },
        DateRangeType: 'CUSTOM_DATE',
        FieldNames: ['CampaignId', 'CampaignName', 'Date', 'Impressions', 'Clicks', 'Cost', 'Ctr', 'AvgCpc', 'Conversions'],
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject<CampaignPerformanceReportRow>({
      CampaignId: 1,
      CampaignName: 'Campaign 1',
      Date: '2024-01-01',
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
      AvgCpc: 100,
      Conversions: 2,
    })
  })
})
```

Run test:

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: FAIL — `getOverallCampaignReport` not exported.

- [ ] **Step 2: Implement `getOverallCampaignReport` in `src/api/direct.ts`**

```typescript
export async function getOverallCampaignReport(
  token: string,
  clientLogin: string | null,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<CampaignPerformanceReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: {
        DateFrom: dateFrom,
        DateTo: dateTo,
      },
      FieldNames: ['CampaignId', 'CampaignName', 'Date', 'Impressions', 'Clicks', 'Cost', 'Ctr', 'AvgCpc', 'Conversions'],
      ReportName: `OverallCampaignPerformance_${dateFrom}_${dateTo}`,
      ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
      DateRangeType: 'CUSTOM_DATE',
      Format: 'TSV',
      IncludeVAT: 'YES',
      IncludeDiscount: 'NO',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Общий отчёт по кампаниям')
  const rows = parseTsv(ready)
  return rows.map((row) => campaignPerformanceReportRowSchema.parse(row))
}
```

- [ ] **Step 3: Run test to verify it passes**

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/api/direct.ts src/api/direct.test.ts
git commit -m "feat(overall-analytics): add overall campaign report API and test"
```

---

### Task 3: Add overall ad report API

**Files:**
- Modify: `src/api/direct.ts`
- Modify: `src/api/direct.test.ts`

- [ ] **Step 1: Write failing test in `src/api/direct.test.ts`**

```typescript
import { getOverallAdReport } from './direct'

// inside describe block:
describe('getOverallAdReport', () => {
  it('returns parsed rows without CampaignId filter and includes campaign details', async () => {
    const tsv = 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t1000\t50\t5000\t5'
    mockDirectFetch(textResponse(tsv))

    const rows = await getOverallAdReport(TOKEN, LOGIN, '2024-01-01', '2024-01-31')
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
        },
        DateRangeType: 'CUSTOM_DATE',
        FieldNames: ['CampaignId', 'CampaignName', 'AdId', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject<AdReportRow>({
      CampaignId: 1,
      CampaignName: 'Campaign 1',
      AdId: 10,
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
    })
  })
})
```

Run test:

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: FAIL — `getOverallAdReport` not exported.

- [ ] **Step 2: Implement `getOverallAdReport` in `src/api/direct.ts`**

```typescript
export async function getOverallAdReport(
  token: string,
  clientLogin: string | null,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<AdReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: {
        DateFrom: dateFrom,
        DateTo: dateTo,
      },
      FieldNames: ['CampaignId', 'CampaignName', 'AdId', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      ReportName: `OverallAdReport_${dateFrom}_${dateTo}`,
      ReportType: 'AD_PERFORMANCE_REPORT',
      DateRangeType: 'CUSTOM_DATE',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Общий отчёт по объявлениям')
  const rows = parseTsv(ready)
  return rows.map((row) => adReportRowSchema.parse(row))
}
```

- [ ] **Step 3: Run test to verify it passes**

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/api/direct.ts src/api/direct.test.ts
git commit -m "feat(overall-analytics): add overall ad report API and test"
```

---

### Task 4: Add overall search terms report API

**Files:**
- Modify: `src/api/direct.ts`
- Modify: `src/api/direct.test.ts`

- [ ] **Step 1: Write failing test in `src/api/direct.test.ts`**

```typescript
import { getOverallSearchTermsReport } from './direct'

// inside describe block:
describe('getOverallSearchTermsReport', () => {
  it('returns parsed rows without CampaignId filter and includes campaign details', async () => {
    const tsv = 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t1000\t50\t5000\t5'
    mockDirectFetch(textResponse(tsv))

    const rows = await getOverallSearchTermsReport(TOKEN, LOGIN, '2024-01-01', '2024-01-31')
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
        },
        DateRangeType: 'CUSTOM_DATE',
        FieldNames: ['CampaignId', 'CampaignName', 'Query', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject<SearchTermReportRow>({
      CampaignId: 1,
      CampaignName: 'Campaign 1',
      Query: 'query',
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
    })
  })
})
```

Run test:

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: FAIL — `getOverallSearchTermsReport` not exported.

- [ ] **Step 2: Implement `getOverallSearchTermsReport` in `src/api/direct.ts`**

```typescript
export async function getOverallSearchTermsReport(
  token: string,
  clientLogin: string | null,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<SearchTermReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: {
        DateFrom: dateFrom,
        DateTo: dateTo,
      },
      FieldNames: ['CampaignId', 'CampaignName', 'Query', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      ReportName: `OverallSearchTerms_${dateFrom}_${dateTo}`,
      ReportType: 'SEARCH_QUERY_PERFORMANCE_REPORT',
      DateRangeType: 'CUSTOM_DATE',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Общий отчёт по поисковым запросам')
  const rows = parseTsv(ready)
  return rows.map((row) => searchTermReportRowSchema.parse(row))
}
```

- [ ] **Step 3: Run test to verify it passes**

```bash
npm run test:unit -- src/api/direct.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/api/direct.ts src/api/direct.test.ts
git commit -m "feat(overall-analytics): add overall search terms report API and test"
```

---

### Task 5: Update useCampaignReports hooks to support `'all'`

**Files:**
- Modify: `src/hooks/useCampaignReports.ts`
- Modify: `src/hooks/useCampaignReports.test.tsx`

- [ ] **Step 1: Import new overall functions in `src/hooks/useCampaignReports.ts`**

```typescript
import {
  getAdReport,
  getCampaignReport,
  getOverallAdReport,
  getOverallCampaignReport,
  getOverallSearchTermsReport,
  getSearchTermsReport,
} from '../api/direct'
```

- [ ] **Step 2: Update `useCampaignPerformanceReport` signature and logic**

```typescript
export function useCampaignPerformanceReport(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['campaignPerformanceReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => {
      if (campaignId === 'all') {
        return getOverallCampaignReport(token!, clientLogin, dates.from, dates.to, sandbox)
      }
      return getCampaignReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox)
    },
    enabled: !!token && !!dates.from && !!dates.to && campaignId !== null && campaignId !== undefined,
  })
}
```

- [ ] **Step 3: Update `useAdReport` signature and logic**

```typescript
export function useAdReport(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['adReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => {
      if (campaignId === 'all') {
        return getOverallAdReport(token!, clientLogin, dates.from, dates.to, sandbox)
      }
      return getAdReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox)
    },
    enabled: !!token && !!dates.from && !!dates.to && campaignId !== null && campaignId !== undefined,
  })
}
```

- [ ] **Step 4: Update `useSearchTermsReport` signature and logic**

```typescript
export function useSearchTermsReport(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['searchTermsReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => {
      if (campaignId === 'all') {
        return getOverallSearchTermsReport(token!, clientLogin, dates.from, dates.to, sandbox)
      }
      return getSearchTermsReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox)
    },
    enabled: !!token && !!dates.from && !!dates.to && campaignId !== null && campaignId !== undefined,
  })
}
```

- [ ] **Step 5: Update `useCampaignPerformanceComparison` signature**

```typescript
export function useCampaignPerformanceComparison(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const previousDates = getPreviousPeriod(dates)
  const current = useCampaignPerformanceReport(campaignId, dates, sandbox)
  const previous = useCampaignPerformanceReport(campaignId, previousDates, sandbox)
  return { current, previous }
}
```

- [ ] **Step 6: Add test for `'all'` in `src/hooks/useCampaignReports.test.tsx`**

```typescript
import { getOverallCampaignReport } from '../api/direct'

// Add inside describe('useCampaignPerformanceReport'):
  it('calls overall report when campaignId is all', async () => {
    const tsv = 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useCampaignPerformanceReport('all', { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].CampaignId).toBe(1)
  })
```

Add a test for `useAdReport('all', ...)`:

```typescript
  it('calls overall ad report when campaignId is all', async () => {
    const tsv = 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t1000\t50\t5000\t5'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useAdReport('all', { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].CampaignId).toBe(1)
  })
```

Add a test for `useSearchTermsReport('all', ...)`:

```typescript
  it('calls overall search terms report when campaignId is all', async () => {
    const tsv = 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t1000\t50\t5000\t5'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useSearchTermsReport('all', { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].CampaignId).toBe(1)
  })
```

- [ ] **Step 7: Run tests**

```bash
npm run test:unit -- src/hooks/useCampaignReports.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useCampaignReports.ts src/hooks/useCampaignReports.test.tsx
git commit -m "feat(overall-analytics): support 'all' campaignId in report hooks"
```

---

### Task 6: Refactor CampaignKpiCards to universal KpiCards

**Files:**
- Move: `src/components/campaign-analytics/CampaignKpiCards.tsx` → `src/components/campaign-analytics/KpiCards.tsx`
- Move: `src/components/campaign-analytics/CampaignKpiCards.test.tsx` → `src/components/campaign-analytics/KpiCards.test.tsx`

- [ ] **Step 1: Rename files and update component name**

```bash
git mv src/components/campaign-analytics/CampaignKpiCards.tsx src/components/campaign-analytics/KpiCards.tsx
git mv src/components/campaign-analytics/CampaignKpiCards.test.tsx src/components/campaign-analytics/KpiCards.test.tsx
```

- [ ] **Step 2: Update prop type in `src/components/campaign-analytics/KpiCards.tsx`**

```typescript
interface KpiCardsProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}
```

Change function name and export from `CampaignKpiCards` to `KpiCards`.

- [ ] **Step 3: Update `src/components/campaign-analytics/KpiCards.test.tsx`**

Replace imports:

```typescript
import { KpiCards } from './KpiCards'
```

Replace usage of `CampaignKpiCards` with `KpiCards`.

Add a test for `'all'`:

```typescript
  it('renders aggregated KPIs for all campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-01\t1000\t50\t5000\t5\t100\t2\n2\tCampaign 2\t2024-01-01\t500\t25\t2500\t5\t100\t1',
        }),
      },
    })
    const { container } = render(<KpiCards campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper })
    await waitFor(() => expect(container.textContent).toContain('Показы'))
    expect(container.textContent).toContain('1 500')
  })
```

- [ ] **Step 4: Run tests**

```bash
npm run test:unit -- src/components/campaign-analytics/KpiCards.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign-analytics/KpiCards.tsx src/components/campaign-analytics/KpiCards.test.tsx
git commit -m "refactor(overall-analytics): make KpiCards universal for single and all campaigns"
```

---

### Task 7: Refactor CampaignTrendChart to universal TrendChart

**Files:**
- Move: `src/components/campaign-analytics/CampaignTrendChart.tsx` → `src/components/campaign-analytics/TrendChart.tsx`
- Move: `src/components/campaign-analytics/CampaignTrendChart.test.tsx` → `src/components/campaign-analytics/TrendChart.test.tsx`

- [ ] **Step 1: Rename files**

```bash
git mv src/components/campaign-analytics/CampaignTrendChart.tsx src/components/campaign-analytics/TrendChart.tsx
git mv src/components/campaign-analytics/CampaignTrendChart.test.tsx src/components/campaign-analytics/TrendChart.test.tsx
```

- [ ] **Step 2: Update `src/components/campaign-analytics/TrendChart.tsx`**

Change prop type:

```typescript
interface TrendChartProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}
```

Update `transformToChartData` to sum by date:

```typescript
function transformToChartData(
  rows: CampaignPerformanceReportRow[] | undefined
): ChartDataPoint[] {
  if (!rows) return []
  const byDate = new Map<string, { Clicks: number; Cost: number }>()
  for (const row of rows) {
    const existing = byDate.get(row.Date) ?? { Clicks: 0, Cost: 0 }
    existing.Clicks += row.Clicks
    existing.Cost += row.Cost
    byDate.set(row.Date, existing)
  }
  return Array.from(byDate.entries()).map(([date, values]) => ({
    date,
    Clicks: values.Clicks,
    Cost: values.Cost,
  }))
}
```

Change export name to `TrendChart`. Update export filename in `handleExport`:

```typescript
const filename = campaignId === 'all'
  ? `overall-trend-${dateFrom}-${dateTo}.csv`
  : `campaign-trend-${campaignId}-${dateFrom}-${dateTo}.csv`
```

- [ ] **Step 3: Update `src/components/campaign-analytics/TrendChart.test.tsx`**

Replace imports and usage. Add test for `'all'`:

```typescript
  it('sums data by date for all campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tA\t2024-01-01\t1000\t10\t100\t1\t10\t1\n2\tB\t2024-01-01\t1000\t20\t200\t2\t10\t1',
        }),
      },
    })
    const { container } = render(<TrendChart campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper })
    await waitFor(() => expect(container.textContent).toContain('Динамика'))
  })
```

- [ ] **Step 4: Run tests**

```bash
npm run test:unit -- src/components/campaign-analytics/TrendChart.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign-analytics/TrendChart.tsx src/components/campaign-analytics/TrendChart.test.tsx
git commit -m "refactor(overall-analytics): make TrendChart universal and aggregate by date"
```

---

### Task 8: Extend DataTable with optional column formatter

**Files:**
- Modify: `src/components/ui/DataTable.tsx`

- [ ] **Step 1: Add `format` to `DataTableColumn` type**

```typescript
export type DataTableColumn = {
  key: string
  label: string
  metric?: string
  format?: (value: number) => string
  align?: 'left' | 'right'
  sortable?: boolean
}
```

- [ ] **Step 2: Use `format` when rendering cells**

```typescript
{isFirst
  ? String(value ?? '—')
  : column.format
    ? column.format(Number(value ?? 0))
    : formatMetricValue(Number(value ?? 0), column.metric)}
```

- [ ] **Step 3: Run existing DataTable tests**

```bash
npm run test:unit -- src/components/ui/DataTable.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/DataTable.tsx
git commit -m "feat(ui): add optional per-column format function to DataTable"
```

---

### Task 9: Refactor CampaignAdsReport to universal AdsReport

**Files:**
- Move: `src/components/campaign-analytics/CampaignAdsReport.tsx` → `src/components/campaign-analytics/AdsReport.tsx`
- Move: `src/components/campaign-analytics/CampaignAdsReport.test.tsx` → `src/components/campaign-analytics/AdsReport.test.tsx`

- [ ] **Step 1: Rename files**

```bash
git mv src/components/campaign-analytics/CampaignAdsReport.tsx src/components/campaign-analytics/AdsReport.tsx
git mv src/components/campaign-analytics/CampaignAdsReport.test.tsx src/components/campaign-analytics/AdsReport.test.tsx
```

- [ ] **Step 2: Update `src/components/campaign-analytics/AdsReport.tsx`**

Change prop type:

```typescript
interface AdsReportProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}
```

Update `transformRows` to include campaign info:

```typescript
function transformRows(rows: AdReportRow[] | undefined, showCampaign: boolean): DataTableRow[] {
  if (!rows) return []
  return rows.map((row) => ({
    name: String(row.AdId),
    campaign: showCampaign
      ? `${row.CampaignName ?? '—'} (ID: ${row.CampaignId ?? '—'})`
      : undefined,
    Impressions: row.Impressions,
    Clicks: row.Clicks,
    Cost: row.Cost,
    Ctr: row.Ctr,
  }))
}
```

Build columns conditionally:

```typescript
function getColumns(showCampaign: boolean): DataTableColumn[] {
  const columns: DataTableColumn[] = [{ key: 'name', label: 'Объявление', align: 'left' }]
  if (showCampaign) {
    columns.push({ key: 'campaign', label: 'Кампания', align: 'left' })
  }
  columns.push(
    { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
    { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
    { key: 'Cost', label: 'Расход', align: 'right', sortable: true },
    { key: 'Ctr', label: 'CTR', align: 'right', sortable: true }
  )
  return columns
}
```

Change function name to `AdsReport`. Use `campaignId === 'all'` to determine `showCampaign` and export filename:

```typescript
export function AdsReport({ campaignId, dateFrom, dateTo, sandbox = false }: AdsReportProps) {
  const { data, isLoading, error, refetch } = useAdReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )
  const showCampaign = campaignId === 'all'
  const columns = getColumns(showCampaign)
  const tableRows = transformRows(data, showCampaign)

  function handleExport() {
    if (!tableRows.length) return
    const filename = campaignId === 'all'
      ? `overall-ads-report-${dateFrom}-${dateTo}.csv`
      : `ads-report-${campaignId}-${dateFrom}-${dateTo}.csv`
    exportToCsv(filename, columns.map((c) => ({ key: c.key, label: c.label })), tableRows)
  }

  return (
    <DashboardWidget ...>
      ...
    </DashboardWidget>
  )
}
```

- [ ] **Step 3: Update `src/components/campaign-analytics/AdsReport.test.tsx`**

Replace imports and usage. Add test for `'all'`:

```typescript
  it('renders campaign column for all campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t100\t5\t500\t5',
        }),
      },
    })
    const { container } = render(<AdsReport campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper })
    await waitFor(() => expect(container.textContent).toContain('Campaign 1'))
  })
```

- [ ] **Step 4: Run tests**

```bash
npm run test:unit -- src/components/campaign-analytics/AdsReport.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign-analytics/AdsReport.tsx src/components/campaign-analytics/AdsReport.test.tsx
git commit -m "refactor(overall-analytics): make AdsReport universal with optional campaign column"
```

---

### Task 10: Refactor CampaignSearchTermsReport to universal SearchTermsReport

**Files:**
- Move: `src/components/campaign-analytics/CampaignSearchTermsReport.tsx` → `src/components/campaign-analytics/SearchTermsReport.tsx`
- Move: `src/components/campaign-analytics/CampaignSearchTermsReport.test.tsx` → `src/components/campaign-analytics/SearchTermsReport.test.tsx`

- [ ] **Step 1: Rename files**

```bash
git mv src/components/campaign-analytics/CampaignSearchTermsReport.tsx src/components/campaign-analytics/SearchTermsReport.tsx
git mv src/components/campaign-analytics/CampaignSearchTermsReport.test.tsx src/components/campaign-analytics/SearchTermsReport.test.tsx
```

- [ ] **Step 2: Update `src/components/campaign-analytics/SearchTermsReport.tsx`**

Mirror the changes from `AdsReport`:

```typescript
interface SearchTermsReportProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

function transformRows(rows: SearchTermReportRow[] | undefined, showCampaign: boolean): DataTableRow[] {
  if (!rows) return []
  return rows.map((row) => ({
    name: row.Query,
    campaign: showCampaign
      ? `${row.CampaignName ?? '—'} (ID: ${row.CampaignId ?? '—'})`
      : undefined,
    Impressions: row.Impressions,
    Clicks: row.Clicks,
    Cost: row.Cost,
    Ctr: row.Ctr,
  }))
}

function getColumns(showCampaign: boolean): DataTableColumn[] {
  const columns: DataTableColumn[] = [{ key: 'name', label: 'Поисковый запрос', align: 'left' }]
  if (showCampaign) {
    columns.push({ key: 'campaign', label: 'Кампания', align: 'left' })
  }
  columns.push(
    { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
    { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
    { key: 'Cost', label: 'Расход', align: 'right', sortable: true },
    { key: 'Ctr', label: 'CTR', align: 'right', sortable: true }
  )
  return columns
}

export function SearchTermsReport({ campaignId, dateFrom, dateTo, sandbox = false }: SearchTermsReportProps) {
  ...
}
```

- [ ] **Step 3: Update `src/components/campaign-analytics/SearchTermsReport.test.tsx`**

Replace imports and usage. Add test for `'all'`:

```typescript
  it('renders campaign column for all campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t100\t5\t500\t5',
        }),
      },
    })
    const { container } = render(
      <SearchTermsReport campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />,
      { wrapper }
    )
    await waitFor(() => expect(container.textContent).toContain('Campaign 1'))
    expect(container.textContent).toContain('query')
  })
```

- [ ] **Step 4: Run tests**

```bash
npm run test:unit -- src/components/campaign-analytics/SearchTermsReport.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign-analytics/SearchTermsReport.tsx src/components/campaign-analytics/SearchTermsReport.test.tsx
git commit -m "refactor(overall-analytics): make SearchTermsReport universal with optional campaign column"
```

---

### Task 11: Create CampaignSummaryTable

**Files:**
- Create: `src/components/campaign-analytics/CampaignSummaryTable.tsx`
- Create: `src/components/campaign-analytics/CampaignSummaryTable.test.tsx`

- [ ] **Step 1: Create `src/components/campaign-analytics/CampaignSummaryTable.tsx`**

```typescript
import { useCampaignPerformanceReport } from '../../hooks/useCampaignReports'
import type { CampaignPerformanceReportRow } from '../../types'
import { exportToCsv } from '../../lib/csvExport'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable, type DataTableColumn, type DataTableRow } from '../ui/DataTable'

interface CampaignSummaryTableProps {
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

interface CampaignTotals {
  name: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  AvgCpc: number
  Conversions: number
}

function groupByCampaign(
  rows: CampaignPerformanceReportRow[] | undefined
): Map<number, CampaignPerformanceReportRow[]> {
  const map = new Map<number, CampaignPerformanceReportRow[]>()
  if (!rows) return map
  for (const row of rows) {
    if (row.CampaignId === undefined) continue
    const existing = map.get(row.CampaignId) ?? []
    existing.push(row)
    map.set(row.CampaignId, existing)
  }
  return map
}

function calculateCampaignTotals(rows: CampaignPerformanceReportRow[]): Omit<CampaignTotals, 'name'> {
  const totals = { Impressions: 0, Clicks: 0, Cost: 0, Conversions: 0 }
  for (const row of rows) {
    totals.Impressions += row.Impressions
    totals.Clicks += row.Clicks
    totals.Cost += row.Cost
    totals.Conversions += row.Conversions
  }
  const Ctr = totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0
  const AvgCpc = totals.Clicks > 0 ? totals.Cost / totals.Clicks : 0
  return { ...totals, Ctr, AvgCpc }
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}%`
}

const COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Кампания', align: 'left' },
  { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
  { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
  { key: 'Cost', label: 'Расход', align: 'right', sortable: true, format: formatCurrency },
  { key: 'Ctr', label: 'CTR', align: 'right', sortable: true, format: formatPercent },
  { key: 'AvgCpc', label: 'Ср. CPC', align: 'right', sortable: true, format: formatCurrency },
  { key: 'Conversions', label: 'Конверсии', align: 'right', sortable: true },
]

export function CampaignSummaryTable({ dateFrom, dateTo, sandbox = false }: CampaignSummaryTableProps) {
  const { data, isLoading, error, refetch } = useCampaignPerformanceReport(
    'all',
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const grouped = groupByCampaign(data)
  const rows: DataTableRow[] = Array.from(grouped.entries())
    .map(([id, campaignRows]) => {
      const totals = calculateCampaignTotals(campaignRows)
      const firstRow = campaignRows[0]
      return {
        name: `${firstRow?.CampaignName ?? '—'} (ID: ${id})`,
        ...totals,
      }
    })
    .sort((a, b) => (b.Cost as number) - (a.Cost as number))

  function handleExport() {
    if (!rows.length) return
    exportToCsv(
      `campaign-summary-${dateFrom}-${dateTo}.csv`,
      COLUMNS.map((c) => ({ key: c.key, label: c.label })),
      rows
    )
  }

  return (
    <DashboardWidget
      title="Сводка по кампаниям"
      subtitle="Агрегированные метрики за период"
      isLoading={isLoading && !data}
      error={error as Error | null}
      onRetry={() => refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable columns={COLUMNS} rows={rows} />
      </div>
      <MobileListCard columns={COLUMNS} rows={rows} />
    </DashboardWidget>
  )
}
```

- [ ] **Step 2: Create failing test in `src/components/campaign-analytics/CampaignSummaryTable.test.tsx`**

```typescript
import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { CampaignSummaryTable } from './CampaignSummaryTable'

const authState = createMockAuthState({ token: 'token', clientLogin: 'login', hasToken: true })

function createWrapper(appState: AppState = createMockAppState()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestQueryProvider>
        <MockAuthProvider state={authState}>
          <MockAppProvider state={appState}>{children}</MockAppProvider>
        </MockAuthProvider>
      </TestQueryProvider>
    )
  }
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('CampaignSummaryTable', () => {
  it('renders aggregated campaign rows', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign A\t2024-01-01\t1000\t50\t5000\t5\t100\t2\n2\tCampaign B\t2024-01-01\t500\t25\t2500\t5\t100\t1',
        }),
      },
    })
    render(<CampaignSummaryTable dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Campaign A')).toBeInTheDocument())
    expect(screen.getByText('Campaign B')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test**

```bash
npm run test:unit -- src/components/campaign-analytics/CampaignSummaryTable.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/campaign-analytics/CampaignSummaryTable.tsx src/components/campaign-analytics/CampaignSummaryTable.test.tsx
git commit -m "feat(overall-analytics): add CampaignSummaryTable widget"
```

---

### Task 12: Create OverallAnalytics component

**Files:**
- Create: `src/components/OverallAnalytics.tsx`
- Create: `src/components/OverallAnalytics.test.tsx`

- [ ] **Step 1: Create `src/components/OverallAnalytics.tsx`**

```typescript
import { BarChart3, ToggleLeft } from 'lucide-react'

import { useCampaigns } from '../api/direct'
import { useApp } from '../hooks/useApp'
import { isValidDateRange } from '../lib/dateRanges'

import { AdsReport } from './campaign-analytics/AdsReport'
import { CampaignSummaryTable } from './campaign-analytics/CampaignSummaryTable'
import { KpiCards } from './campaign-analytics/KpiCards'
import { SearchTermsReport } from './campaign-analytics/SearchTermsReport'
import { TrendChart } from './campaign-analytics/TrendChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'

export default function OverallAnalytics() {
  const { dateRange, setDateRange, directSandbox, setDirectSandbox } = useApp()
  const { data: campaigns, isLoading, isError, error, refetch } = useCampaigns(directSandbox)
  const datesValid = isValidDateRange(dateRange)

  if (isLoading && !campaigns) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Общая аналитика</h2>
        </div>
        <div className="text-body-md text-on-surface-muted">Загрузка кампаний...</div>
      </div>
    )
  }

  if (!isLoading && !isError && campaigns?.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Общая аналитика</h2>
        </div>
        <EmptyState
          message="Нет кампаний"
          hint="Убедитесь, что токен имеет доступ к Яндекс Директу. Попробуйте включить песочницу для тестовых данных."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Общая аналитика</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setDirectSandbox(!directSandbox)}
            className={`inline-flex items-center justify-center gap-2 h-9 px-3 rounded-sm text-label-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus ${
              directSandbox
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-surface-elevated border border-outline text-on-surface-muted hover:text-on-surface'
            }`}
            aria-pressed={directSandbox}
            aria-label={directSandbox ? 'Отключить песочницу Директа' : 'Включить песочницу Директа'}
          >
            <ToggleLeft className="w-4 h-4" aria-hidden="true" />
            Песочница
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {!datesValid && (
        <ErrorAlert message="Выберите корректный период: начало не позже конца, даты не в будущем" />
      )}

      <KpiCards campaignId="all" dateFrom={dateRange.from} dateTo={dateRange.to} sandbox={directSandbox} />
      <TrendChart campaignId="all" dateFrom={dateRange.from} dateTo={dateRange.to} sandbox={directSandbox} />
      <CampaignSummaryTable dateFrom={dateRange.from} dateTo={dateRange.to} sandbox={directSandbox} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdsReport campaignId="all" dateFrom={dateRange.from} dateTo={dateRange.to} sandbox={directSandbox} />
        <SearchTermsReport campaignId="all" dateFrom={dateRange.from} dateTo={dateRange.to} sandbox={directSandbox} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/OverallAnalytics.test.tsx`**

```typescript
import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../test/mocks'

import OverallAnalytics from './OverallAnalytics'

const authState = createMockAuthState({ token: 'token', clientLogin: 'login', hasToken: true })

function createWrapper(appState: AppState = createMockAppState()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestQueryProvider>
        <MockAuthProvider state={authState}>
          <MockAppProvider state={appState}>{children}</MockAppProvider>
        </MockAuthProvider>
      </TestQueryProvider>
    )
  }
}

function mockCampaignsResponse(body: string) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue({ status: 200, body }) } })
}

function mockOverallResponses() {
  Object.assign(window, {
    electronAPI: {
      directFetch: vi.fn().mockImplementation((_url: string, options: { body: { method?: string; params?: { ReportType?: string } } }) => {
        const method = options.body?.method
        const reportType = options.body?.params?.ReportType

        if (method === 'get') {
          return {
            status: 200,
            body: JSON.stringify({
              result: {
                Campaigns: [{ Id: 1, Name: 'Campaign 1', Status: 'ACCEPTED', Type: 'TEXT', State: 'ON', Currency: 'RUB' }],
              },
            }),
          }
        }

        if (reportType === 'CAMPAIGN_PERFORMANCE_REPORT') {
          return {
            status: 200,
            body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-01\t1000\t50\t5000\t5\t100\t2',
          }
        }

        if (reportType === 'AD_PERFORMANCE_REPORT') {
          return {
            status: 200,
            body: 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t100\t5\t500\t5',
          }
        }

        return {
          status: 200,
          body: 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t100\t5\t500\t5',
        }
      }),
    },
  })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('OverallAnalytics', () => {
  it('renders heading', () => {
    mockOverallResponses()
    render(<OverallAnalytics />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { name: 'Общая аналитика' })).toBeInTheDocument()
  })

  it('shows empty state when no campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: JSON.stringify({ result: { Campaigns: [] } }),
        }),
      },
    })
    render(<OverallAnalytics />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Нет кампаний')).toBeInTheDocument())
  })

  it('renders widgets when campaigns exist', async () => {
    mockOverallResponses()
    render(<OverallAnalytics />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Campaign 1')).toBeInTheDocument())
    expect(screen.getByText('Показы')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm run test:unit -- src/components/OverallAnalytics.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/OverallAnalytics.tsx src/components/OverallAnalytics.test.tsx
git commit -m "feat(overall-analytics): add OverallAnalytics dashboard component"
```

---

### Task 13: Add navigation and App routing

**Files:**
- Modify: `src/lib/navigation.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add navigation item in `src/lib/navigation.ts`**

```typescript
import { Activity, BarChart3, Key, LineChart, Target, TrendingUp, type LucideIcon } from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  requiresCounter?: boolean
  section: 'frequent' | 'rare'
}

export const navigationItems: NavItem[] = [
  { id: 'metrics', label: 'Графики', icon: LineChart, requiresCounter: true, section: 'frequent' },
  { id: 'counters', label: 'Счётчики', icon: BarChart3, section: 'frequent' },
  { id: 'campaigns', label: 'Кампании', icon: Target, section: 'frequent' },
  { id: 'company-analytics', label: 'Аналитика кампании', icon: TrendingUp, section: 'frequent' },
  { id: 'overall-analytics', label: 'Общая аналитика', icon: BarChart3, section: 'frequent' },
  { id: 'token', label: 'Токен', icon: Key, section: 'rare' },
  { id: 'diagnostics', label: 'Диагностика', icon: Activity, section: 'rare' },
]
```

- [ ] **Step 2: Add lazy import and route in `src/App.tsx`**

```typescript
const OverallAnalytics = lazy(() => import('./components/OverallAnalytics'))
```

Add inside main content area:

```typescript
<ErrorBoundary>
  {activeTab === 'overall-analytics' && (
    <Suspense fallback={<TabLoader />}>
      <OverallAnalytics />
    </Suspense>
  )}
</ErrorBoundary>
```

- [ ] **Step 3: Run App tests**

```bash
npm run test:unit -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/navigation.ts src/App.tsx
git commit -m "feat(overall-analytics): add navigation tab and App routing"
```

---

### Task 14: Update CampaignAnalytics imports

**Files:**
- Modify: `src/components/CampaignAnalytics.tsx`
- Modify: `src/components/CampaignAnalytics.test.tsx`

- [ ] **Step 1: Update imports in `src/components/CampaignAnalytics.tsx`**

```typescript
import { TrendingUp } from 'lucide-react'

import { useApp } from '../hooks/useApp'
import { isValidDateRange } from '../lib/dateRanges'

import { AdsReport } from './campaign-analytics/AdsReport'
import { KpiCards } from './campaign-analytics/KpiCards'
import { CampaignSelector } from './campaign-analytics/CampaignSelector'
import { SearchTermsReport } from './campaign-analytics/SearchTermsReport'
import { TrendChart } from './campaign-analytics/TrendChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
```

Replace usages inside the component:

```typescript
<KpiCards campaignId={selectedCampaignId} ... />
<TrendChart campaignId={selectedCampaignId} ... />
<AdsReport campaignId={selectedCampaignId} ... />
<SearchTermsReport campaignId={selectedCampaignId} ... />
```

- [ ] **Step 2: Update `src/components/CampaignAnalytics.test.tsx`**

Update the `directFetch` mock body to match the expected overall API shape? No, the existing test mocks the single-campaign API. It should continue to work because `KpiCards`/`TrendChart`/`AdsReport`/`SearchTermsReport` still call the single-campaign API when `campaignId` is a number. The only change is imports and the expected report headers.

Update the mock bodies to include the expected `ReportType` responses:

```typescript
electronAPI: {
  directFetch: vi.fn().mockImplementation((_url: string, options: { body: { params: { ReportType: string } } }) => {
    const reportType = options.body.params.ReportType
    if (reportType === 'CAMPAIGN_PERFORMANCE_REPORT') {
      return { status: 200, body: 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-15\t1000\t50\t5000\t5\t100\t2' }
    }
    if (reportType === 'AD_PERFORMANCE_REPORT') {
      return { status: 200, body: 'AdId\tImpressions\tClicks\tCost\tCtr\n1\t1000\t50\t5000\t5' }
    }
    return { status: 200, body: 'Query\tImpressions\tClicks\tCost\tCtr\nquery\t1000\t50\t5000\t5' }
  }),
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test:unit -- src/components/CampaignAnalytics.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/CampaignAnalytics.tsx src/components/CampaignAnalytics.test.tsx
git commit -m "refactor(overall-analytics): update CampaignAnalytics to use universal widgets"
```

---

### Task 15: Final verification

**Files:**
- All touched files

- [ ] **Step 1: Run all unit tests**

```bash
npm run test:unit
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: production build succeeds.

- [ ] **Step 4: Commit any remaining changes and update docs**

```bash
git add docs/superpowers/plans/2026-06-17-overall-analytics.md docs/features/company-analytics/README.md docs/features/company-analytics/checklist.md
git commit -m "docs(overall-analytics): finalize plan and update feature docs"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** Every REQ from the spec maps to a task above.
- [ ] **No placeholders:** No TBD, TODO, or vague steps remain.
- [ ] **Type consistency:** `campaignId: number | 'all'` used consistently across hooks and components.
- [ ] **File names:** Renames use `git mv` to preserve history.
- [ ] **Tests:** Each new function/component has a failing test before implementation.
