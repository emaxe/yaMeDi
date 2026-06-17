# Спецификация: Общая аналитика по кампаниям Директа

## Контекст

В приложении уже есть вкладка «Аналитика кампании», которая показывает KPI, график, отчёты по объявлениям и поисковым запросам для одной выбранной кампании. Пользователь хочет видеть аналогичный отчёт сразу по всем кампаниям Директа в одной новой вкладке «Общая аналитика».

## Требования

REQ-1. Добавить новый пункт навигации «Общая аналитика» рядом с «Аналитика кампании» в `src/lib/navigation.ts`.

REQ-2. Добавить новый компонент `src/components/OverallAnalytics.tsx`, лениво загружаемый в `src/App.tsx` для вкладки `overall-analytics`.

REQ-3. Рефакторить `src/components/campaign-analytics/CampaignKpiCards.tsx` в универсальный `KpiCards.tsx`, принимающий `campaignId?: number | 'all'`.

REQ-4. Рефакторить `src/components/campaign-analytics/CampaignTrendChart.tsx` в универсальный `TrendChart.tsx`, принимающий `campaignId?: number | 'all'`.

REQ-5. Рефакторить `src/components/campaign-analytics/CampaignAdsReport.tsx` в универсальный `AdsReport.tsx`, принимающий `campaignId?: number | 'all'`.

REQ-6. Рефакторить `src/components/campaign-analytics/CampaignSearchTermsReport.tsx` в универсальный `SearchTermsReport.tsx`, принимающий `campaignId?: number | 'all'`.

REQ-7. Добавить новые API-функции в `src/api/direct.ts` для получения отчётов сразу по всем кампаниям:

- `getOverallCampaignReport` — `CAMPAIGN_PERFORMANCE_REPORT` без фильтра по `CampaignId`, с полями `CampaignId`, `CampaignName`, `Date`, `Impressions`, `Clicks`, `Cost`, `Ctr`, `AvgCpc`, `Conversions`.
- `getOverallAdReport` — `AD_PERFORMANCE_REPORT` без фильтра по `CampaignId`, с полями `CampaignId`, `CampaignName`, `AdId`, `Impressions`, `Clicks`, `Cost`, `Ctr`.
- `getOverallSearchTermsReport` — `SEARCH_QUERY_PERFORMANCE_REPORT` без фильтра по `CampaignId`, с полями `CampaignId`, `CampaignName`, `Query`, `Impressions`, `Clicks`, `Cost`, `Ctr`.

REQ-8. Расширить React Query hooks в `src/hooks/useCampaignReports.ts` так, чтобы они принимали `campaignId: number | 'all'`:

- `useCampaignPerformanceReport`
- `useAdReport`
- `useSearchTermsReport`

При `campaignId === 'all'` хуки вызывают новые функции из REQ-7; при числовом id — существующие функции для одной кампании.

REQ-9. Добавить в `src/types/index.ts` опциональные поля `CampaignId` и `CampaignName` в существующие типы отчётов (`CampaignPerformanceReportRow`, `AdReportRow`, `SearchTermReportRow`). Zod-схемы должны валидировать эти поля как опциональные. Это позволяет универсальным виджетам работать как с одной кампанией, так и с общими отчётами без дублирования типов.

REQ-10. Реализовать агрегацию данных для общего отчёта:

- KPI: сумма `Impressions`, `Clicks`, `Cost`, `Conversions` по всем строкам; `Ctr` пересчитывается как `(Clicks / Impressions) * 100`; `AvgCpc` пересчитывается как `Cost / Clicks`.
- График динамики: сумма `Clicks` и `Cost` по каждой дате.
- Сводная таблица по кампаниям: группировка по `CampaignId` с суммированием метрик; сортировка по умолчанию по убыванию `Cost`.

REQ-11. Добавить новый компонент `src/components/campaign-analytics/CampaignSummaryTable.tsx` — сводная таблица по кампаниям с сортировкой и экспортом CSV.

REQ-12. При отображении общих детальных таблиц `AdsReport` и `SearchTermsReport` добавить столбец «Кампания» (`CampaignName` + `CampaignId`).

REQ-13. Реализовать экспорт CSV для каждого виджета общего отчёта:

- KPI-карточки: CSV с одной строкой агрегированных KPI.
- График: CSV с датами и суммарными `Clicks`, `Cost`.
- Сводная таблица по кампаниям: CSV с отображёнными строками.
- Детальные таблицы: CSV с отображёнными строками (включая столбец кампании).

REQ-14. Использовать общий `DateRangePicker` и общий `directSandbox` из глобального состояния.

REQ-15. Показывать empty state, если у пользователя нет кампаний.

REQ-16. Обработать состояния загрузки, ошибки и пустых данных для каждого виджета через `DashboardWidget`.

REQ-17. Адаптировать вёрстку под мобильные устройства: KPI-карточки стопкой, график через `MobileChartContainer`, таблицы через `MobileListCard`.

REQ-18. Покрыть новые API-функции, hooks и компоненты unit-тестами, обновить тесты существующих компонентов после рефакторинга.

## Ограничения

- Данные только из Direct Reports API; реального времени и webhook-ов не предусматривается.
- Период и флаг песочницы выбираются глобально, а не отдельно для общего отчёта.
- Общий отчёт только читает данные; редактирование кампаний не входит в скоуп.
- Отчёты могут возвращать HTTP 202 и требовать поллинга; используется существующий механизм `fetchReportWithPoll`.
- Общие отчёты без фильтра по кампании могут быть большими; в рамках этой фичи пагинация не реализуется, но предусматривается возможность ограничения `maxRows` в таблицах.

## Архитектура

```
┌─────────────────────────────────────┐
│  OverallAnalytics.tsx               │
│  ├── KpiCards (campaignId='all')    │
│  ├── TrendChart (campaignId='all')    │
│  ├── CampaignSummaryTable           │
│  ├── AdsReport (campaignId='all')    │
│  └── SearchTermsReport (campaignId='all')│
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  useCampaignReports hooks           │
│  (campaignId: number | 'all')       │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  direct.ts API                      │
│  getOverall*Report / get*Report     │
└─────────────────────────────────────┘
```

`CampaignAnalytics.tsx` продолжает использовать те же универсальные виджеты, передавая им `campaignId={selectedCampaignId}`.

## Компоненты

### `OverallAnalytics.tsx`

- Заголовок «Общая аналитика».
- `DateRangePicker` и переключатель песочницы (как в `CampaignAnalytics`).
- Сетка виджетов: `KpiCards`, `TrendChart`, `CampaignSummaryTable`, `AdsReport`, `SearchTermsReport` — все с `campaignId='all'`.
- Empty state при отсутствии кампаний.

### `KpiCards.tsx`

- Prop `campaignId: number | 'all'`.
- Для `'all'` использует `useCampaignPerformanceComparison('all', dates, sandbox)` и суммирует все строки.
- Для числа — существующее поведение.
- Сравнение с предыдущим периодом сохраняется через `getPreviousPeriod`.

### `TrendChart.tsx`

- Prop `campaignId: number | 'all'`.
- Для `'all'` суммирует `Clicks` и `Cost` по `Date`.
- Экспорт CSV с датами и суммарными значениями.

### `CampaignSummaryTable.tsx`

- Prop `campaignId: 'all'` (только для общего отчёта).
- Группирует строки `CampaignPerformanceReportRow` по `CampaignId`.
- Столбцы: Кампания (Name + Id), Показы, Клики, Расход, CTR, Средняя CPC, Конверсии.
- Сортировка по умолчанию по убыванию `Cost`.
- Экспорт CSV.

### `AdsReport.tsx` / `SearchTermsReport.tsx`

- Prop `campaignId: number | 'all'`.
- Для `'all'` добавляют столбец «Кампания» (`CampaignName` + `CampaignId`).
- Для числа — поведение как сейчас.
- Экспорт CSV.

## Data flow

1. `OverallAnalytics` вызывает `useCampaigns(directSandbox)` для получения списка кампаний.
2. Если список пуст — `EmptyState`.
3. Виджеты вызывают hooks с `campaignId='all'`.
4. Хуки при `'all'` обращаются к `getOverall*Report` с `SelectionCriteria` без фильтра `CampaignId`.
5. API возвращает TSV, парсит его и валидирует Zod-схемами с опциональными `CampaignId`/`CampaignName`.
6. Виджеты агрегируют строки и отображают результат.

## Обработка ошибок

- Каждый виджет обёрнут в `DashboardWidget`, который показывает лоадер, ошибку с retry и кнопку экспорта.
- `OverallAnalytics` показывает общий empty state при отсутствии кампаний.
- Ошибки API (включая превышение попыток поллинга) отображаются внутри виджета, не ломают всю страницу.

## Мобильная адаптивность

- KPI-карточки: 1 колонка на мобильном, 2 на планшете, 3 на десктопе.
- График: `MobileChartContainer` с адаптивной высотой.
- Таблицы: `MobileListCard` на мобильном, `DataTable` на десктопе.

## Тестирование

- `src/api/direct.test.ts` — добавить тесты для `getOverallCampaignReport`, `getOverallAdReport`, `getOverallSearchTermsReport` (проверка отсутствия фильтра `CampaignId`, парсинга `CampaignId`/`CampaignName`).
- `src/hooks/useCampaignReports.test.tsx` — добавить тесты для хуков с `campaignId='all'`.
- `src/components/OverallAnalytics.test.tsx` — новый тест: рендер вкладки, empty state, отображение виджетов.
- Обновить `src/components/CampaignAnalytics.test.tsx` — импорты и имена виджетов после рефакторинга.
- Обновить `src/test/mocks.tsx` при необходимости (мок-данные с `CampaignId`/`CampaignName`).
- Проверить `npm run test:unit` и `npm run typecheck` после рефакторинга.

## Кодстайл и конвенции

- Компоненты: PascalCase, располагаются в `src/components/campaign-analytics/`.
- Хуки: `use` + camelCase, в `src/hooks/useCampaignReports.ts`.
- API-функции: camelCase, в `src/api/direct.ts`.
- Типы и интерфейсы: PascalCase, в `src/types/index.ts`.
- Для новых API-запросов использовать Zod-схемы и `ApiError`.
- Для запросов использовать React Query с корректными `queryKey` и `enabled`.
- Для графиков — Recharts внутри `ResponsiveContainer` + `MobileChartContainer`.
- Для обёртки виджетов — `DashboardWidget`.

## Критерии приёмки

- [ ] В навигации появилась вкладка «Общая аналитика».
- [ ] Вкладка открывается без выбора отдельной кампании.
- [ ] Для выбранного периода отображаются агрегированные KPI-карточки с дельтой.
- [ ] Отображается график суммарной динамики по дням (Клики / Расход).
- [ ] Отображается сводная таблица по кампаниям с сортировкой.
- [ ] Отображаются детальные таблицы по объявлениям и поисковым запросам с указанием кампании.
- [ ] Каждый виджет поддерживает экспорт CSV.
- [ ] Корректно обрабатываются загрузка, ошибка, пустые данные и HTTP 202 (поллинг).
- [ ] Вёрстка корректно отображается на мобильном устройстве (width < 768px).
- [ ] Все unit-тесты проходят.
- [ ] Код соответствует существующим конвенциям проекта.

## Затронутые файлы

- `src/lib/navigation.ts`
- `src/App.tsx`
- `src/components/OverallAnalytics.tsx` (новый)
- `src/components/campaign-analytics/CampaignKpiCards.tsx` → `KpiCards.tsx`
- `src/components/campaign-analytics/CampaignTrendChart.tsx` → `TrendChart.tsx`
- `src/components/campaign-analytics/CampaignAdsReport.tsx` → `AdsReport.tsx`
- `src/components/campaign-analytics/CampaignSearchTermsReport.tsx` → `SearchTermsReport.tsx`
- `src/components/campaign-analytics/CampaignSummaryTable.tsx` (новый)
- `src/components/CampaignAnalytics.tsx` (обновление импортов и имён виджетов)
- `src/hooks/useCampaignReports.ts`
- `src/api/direct.ts`
- `src/types/index.ts`
- `src/test/mocks.tsx`
- `src/components/CampaignAnalytics.test.tsx`
- `src/components/OverallAnalytics.test.tsx` (новый)
- `src/api/direct.test.ts`
- `src/hooks/useCampaignReports.test.tsx` (обновление/дополнение)
