export interface KpiData {
  cost: number;
  leads: number;
  cpl: number;
}

export interface ClientFactData {
  week: string; // e.g., "1-7 июня"
  impressions: number;
  clicks: number;
  ctr: number; // in percentage, e.g., 5.4 for 5.4%
  cost: number;
  avgCpc: number;
  leads: number;
  conversionRate: number; // in percentage, e.g., 2.1 for 2.1%
  cpl: number;
  sales?: number;
  cps?: number;
}

export interface CampaignFactData {
  id: string;
  name: string;
  cost: number;
  leads: number;
  cpl: number;
  clicks: number;
  ctr: number;
  conversionRate: number;
}

export interface ClientKpi {
  id: string;
  name: string;
  // Plan for the period (could be weekly or monthly)
  // For simplicity in weekly charts, we assume weekly KPIs
  kpi: KpiData;
  weeklyFacts: ClientFactData[];
  campaigns: CampaignFactData[];
}

export type KpiStatus = 'in-kpi' | 'risk' | 'not-in-kpi';
export type ColorStatus = 'green' | 'yellow' | 'red';
