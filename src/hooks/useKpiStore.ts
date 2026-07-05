import { useState, useEffect } from 'react';
import { KpiData } from '../types/kpi.types';

const STORAGE_KEY = 'yandex_direct_kpi_settings';

export function useKpiStore() {
  const [kpiStore, setKpiStore] = useState<Record<string, KpiData>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setKpiStore(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse KPI settings from localStorage', e);
      }
    }
  }, []);

  const saveKpi = (clientId: string, kpi: KpiData) => {
    const newStore = { ...kpiStore, [clientId]: kpi };
    setKpiStore(newStore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
  };

  return { kpiStore, saveKpi };
}
