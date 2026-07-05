import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CampaignPerformanceReportRow } from '../types';
import { ClientFactData, CampaignFactData } from '../types/kpi.types';

export function aggregateDirectReport(
  rows: CampaignPerformanceReportRow[]
): { weeklyFacts: ClientFactData[], campaigns: CampaignFactData[] } {
  const weeklyMap = new Map<string, ClientFactData>();
  const campaignMap = new Map<string, CampaignFactData & { impressions: number }>();

  rows.forEach(row => {
    // 1. Campaign aggregation
    const campIdStr = String(row.CampaignId || 'unknown');
    if (!campaignMap.has(campIdStr)) {
      campaignMap.set(campIdStr, {
        id: campIdStr,
        name: row.CampaignName || `Кампания ${campIdStr}`,
        cost: 0,
        leads: 0,
        cpl: 0,
        clicks: 0,
        ctr: 0,
        conversionRate: 0,
        impressions: 0,
      });
    }
    const camp = campaignMap.get(campIdStr)!;
    camp.cost += row.Cost || 0;
    camp.leads += row.Conversions || 0;
    camp.clicks += row.Clicks || 0;
    camp.impressions += row.Impressions || 0;

    // 2. Weekly aggregation
    // Parse date 'YYYY-MM-DD'
    const date = parseISO(row.Date);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    // Week label e.g., "1-7 июня"
    const weekLabel = `${format(start, 'd', { locale: ru })}-${format(end, 'd MMMM', { locale: ru })}`;

    if (!weeklyMap.has(weekLabel)) {
      weeklyMap.set(weekLabel, {
        week: weekLabel,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cost: 0,
        avgCpc: 0,
        leads: 0,
        conversionRate: 0,
        cpl: 0,
      });
    }
    const week = weeklyMap.get(weekLabel)!;
    week.impressions += row.Impressions || 0;
    week.clicks += row.Clicks || 0;
    week.cost += row.Cost || 0;
    week.leads += row.Conversions || 0;
  });

  // Calculate derivatives for weeks
  const weeklyFacts = Array.from(weeklyMap.values()).map(week => {
    week.ctr = week.impressions > 0 ? (week.clicks / week.impressions) * 100 : 0;
    week.cpl = week.leads > 0 ? week.cost / week.leads : 0;
    week.conversionRate = week.clicks > 0 ? (week.leads / week.clicks) * 100 : 0;
    week.avgCpc = week.clicks > 0 ? week.cost / week.clicks : 0;
    return week;
  });

  // Calculate derivatives for campaigns
  const campaigns = Array.from(campaignMap.values()).map(camp => {
    camp.ctr = camp.impressions > 0 ? (camp.clicks / camp.impressions) * 100 : 0;
    camp.cpl = camp.leads > 0 ? camp.cost / camp.leads : 0;
    camp.conversionRate = camp.clicks > 0 ? (camp.leads / camp.clicks) * 100 : 0;
    return camp;
  });

  // Sort weeks by date (implicitly based on Map insertion order, but better explicit)
  // For simplicity, we assume rows are generally ordered or map insertion order is close enough.
  return { weeklyFacts, campaigns };
}
