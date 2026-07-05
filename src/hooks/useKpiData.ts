import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getAgencyClients, getOverallCampaignReport } from '../api/direct';
import { useKpiStore } from './useKpiStore';
import { aggregateDirectReport } from '../lib/kpi-aggregator';
import { ClientKpi } from '../types/kpi.types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export function useKpiData() {
  const { token, clientLogin } = useAuth();
  const { kpiStore } = useKpiStore();

  return useQuery({
    queryKey: ['kpi-data', token, clientLogin, kpiStore],
    queryFn: async () => {
      if (!token) return [];

      let clientsToFetch: { id: string, name: string, login: string | null }[] = [];
      
      // Попробуем получить список всех клиентов (если это агентский аккаунт)
      try {
        const agencyClients = await getAgencyClients(token);
        clientsToFetch = agencyClients
          .filter(c => !c.Archived)
          .map(c => ({ id: c.Login, name: c.Login, login: c.Login }));
      } catch (err) {
        // Если это не агентский аккаунт, берем только текущий clientLogin
        console.warn('Не удалось загрузить клиентов агентства, используем текущий логин', err);
        clientsToFetch = [
          { 
            id: clientLogin || 'current-account', 
            name: clientLogin || 'Мой аккаунт', 
            login: clientLogin 
          }
        ];
      }

      // Если список пустой (например, агент без клиентов), возвращаем пустоту
      if (clientsToFetch.length === 0) return [];

      // Fetch data for current month
      const today = new Date();
      const dateFrom = format(startOfMonth(today), 'yyyy-MM-dd');
      const dateTo = format(endOfMonth(today), 'yyyy-MM-dd');

      const results: ClientKpi[] = [];

      for (const client of clientsToFetch) {
        // Fallback default KPI if not configured
        const kpi = kpiStore[client.id] || { cost: 50000, leads: 20, cpl: 2500 };
        
        try {
          const report = await getOverallCampaignReport(token, client.login, dateFrom, dateTo, false);
          
          if (report && report.length > 0) {
            const { weeklyFacts, campaigns } = aggregateDirectReport(report);
            
            results.push({
              id: client.id,
              name: client.name,
              kpi,
              weeklyFacts,
              campaigns
            });
          } else {
            // Client has no stats for this period
            results.push({
              id: client.id,
              name: client.name,
              kpi,
              weeklyFacts: [],
              campaigns: []
            });
          }
        } catch (e) {
          console.error(`Failed to fetch report for ${client.login}`, e);
          // We can optionally skip failed clients or push them with empty facts
        }
      }

      return results;
    },
    enabled: !!token
  });
}
