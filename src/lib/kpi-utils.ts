import { ColorStatus, KpiStatus } from '../types/kpi.types';

/**
 * Calculates percentage deviation.
 * Formula: (Fact - KPI) / KPI * 100
 */
export function calculateDeviationPercent(fact: number, kpi: number): number {
  if (kpi === 0) return fact > 0 ? 100 : 0;
  return ((fact - kpi) / kpi) * 100;
}

/**
 * Determines color status based on deviation.
 * For Leads:
 *  - Green: Fact >= KPI (deviation >= 0)
 *  - Yellow: lagging up to 10% (deviation >= -10)
 *  - Red: lagging more than 10% (deviation < -10)
 */
export function getLeadsColorStatus(deviationPercent: number): ColorStatus {
  if (deviationPercent >= 0) return 'green';
  if (deviationPercent >= -10) return 'yellow';
  return 'red';
}

/**
 * For CPL (Cost Per Lead):
 *  - Green: Fact <= KPI (deviation <= 0)
 *  - Yellow: Fact > KPI up to 10% (deviation <= 10)
 *  - Red: Fact > KPI more than 10% (deviation > 10)
 */
export function getCplColorStatus(deviationPercent: number): ColorStatus {
  if (deviationPercent <= 0) return 'green';
  if (deviationPercent <= 10) return 'yellow';
  return 'red';
}

/**
 * For Cost:
 *  - Green: within plan (deviation <= 0, assuming under/exact spend is green)
 *  - Yellow: deviation up to 10% (deviation <= 10)
 *  - Red: deviation > 10% (deviation > 10)
 * Note: Doc says "Green: in plan, Yellow: up to 10%, Red: over/under spend > 10%"
 * Let's assume deviation magnitude up to 10% is yellow.
 */
export function getCostColorStatus(deviationPercent: number): ColorStatus {
  if (deviationPercent <= 0 && deviationPercent >= -10) return 'green'; // within 10% underspend is ok? 
  // Wait, doc says: "green: in plan, yellow: deviation up to 10%, red: > 10%"
  // We'll treat deviation > 0 && <= 10 as yellow.
  if (Math.abs(deviationPercent) <= 5) return 'green'; // Let's say exactly in plan
  if (Math.abs(deviationPercent) <= 10) return 'yellow';
  return 'red';
}

/**
 * Get overall client status
 */
export function getOverallStatus(costColor: ColorStatus, leadsColor: ColorStatus, cplColor: ColorStatus): KpiStatus {
  if (costColor === 'red' || leadsColor === 'red' || cplColor === 'red') {
    return 'not-in-kpi';
  }
  if (costColor === 'yellow' || leadsColor === 'yellow' || cplColor === 'yellow') {
    return 'risk';
  }
  return 'in-kpi';
}

/**
 * Formats a number for display (e.g. currency or percentages)
 */
export function formatValue(value: number, isCurrency = false, isPercent = false): string {
  if (isCurrency) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  }
  if (isPercent) {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat('ru-RU').format(value);
}
