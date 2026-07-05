import { useState } from 'react';

import { useKpiData } from '../../hooks/useKpiData';
import { useKpiStore } from '../../hooks/useKpiStore';
import {
  calculateDeviationPercent,
  formatValue,
  getCostColorStatus,
  getLeadsColorStatus,
  getCplColorStatus,
  getOverallStatus
} from '../../lib/kpi-utils';
import { ArrowLeft, Target, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { ClientKpiDetails } from './ClientKpiDetails';

export default function KpiDashboard() {
  const { data: clients, isLoading: loading, error, refetch } = useKpiData();
  const { saveKpi } = useKpiStore();
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-on-surface-muted">Загрузка данных из Яндекс Директа...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">Ошибка при загрузке данных: {(error as Error).message}</div>
      </div>
    );
  }

  const clientsData = clients || [];
  const selectedClient = clientsData.find((c) => c.id === selectedClientId);

  if (selectedClient) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedClientId(null)}
          className="flex items-center gap-2 text-sm font-medium text-on-surface-muted hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </button>
        <ClientKpiDetails 
          client={selectedClient} 
          onUpdateKpi={(kpi) => saveKpi(selectedClient.id, kpi)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-background flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Сводка по KPI
        </h1>
        <button
          onClick={() => refetch()}
          className="bg-surface-elevated text-on-background border border-outline px-4 py-2 rounded-md text-sm font-semibold shadow-subtle hover:bg-surface transition"
        >
          Обновить данные
        </button>
      </div>

      <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline bg-surface text-label-sm font-semibold text-on-surface-muted uppercase tracking-wider">
                <th className="p-4">Клиент</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Расход откл. %</th>
                <th className="p-4">Заявки откл. %</th>
                <th className="p-4">CPL откл. %</th>
                <th className="p-4">Что не так</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-background">
              {clientsData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-muted">
                    Нет данных для отображения. Проверьте токен или наличие кампаний в Директе.
                  </td>
                </tr>
              )}
              {clientsData.map((client) => {
                const latestFact = client.weeklyFacts[client.weeklyFacts.length - 1];
                if (!latestFact) {
                  return (
                    <tr key={client.id} className="border-b border-outline hover:bg-surface-soft transition cursor-pointer" onClick={() => setSelectedClientId(client.id)}>
                      <td className="p-4 font-semibold text-on-background">{client.name}</td>
                      <td colSpan={5} className="p-4 text-on-surface-muted">Нет статистики за выбранный период</td>
                    </tr>
                  );
                }

                const costDev = calculateDeviationPercent(latestFact.cost, client.kpi.cost);
                const leadsDev = calculateDeviationPercent(latestFact.leads, client.kpi.leads);
                const cplDev = calculateDeviationPercent(latestFact.cpl, client.kpi.cpl);

                const costColor = getCostColorStatus(costDev);
                const leadsColor = getLeadsColorStatus(leadsDev);
                const cplColor = getCplColorStatus(cplDev);
                const overallStatus = getOverallStatus(costColor, leadsColor, cplColor);

                const statusMap = {
                  'in-kpi': { label: 'В KPI', icon: CheckCircle, className: 'text-green-700 bg-green-100' },
                  'risk': { label: 'Риск', icon: HelpCircle, className: 'text-amber-700 bg-amber-100' },
                  'not-in-kpi': { label: 'Не в KPI', icon: AlertCircle, className: 'text-red-700 bg-red-100' },
                };

                const cellColorClass = (color: string) => {
                  if (color === 'green') return 'text-green-600 font-medium';
                  if (color === 'yellow') return 'text-amber-600 font-medium';
                  return 'text-red-600 font-bold';
                };

                const problems = [];
                if (costColor === 'red') problems.push('Расход вне плана');
                if (leadsColor === 'red') problems.push('Мало заявок');
                if (cplColor === 'red') problems.push('Дорогие заявки');
                const problemText = problems.length > 0 ? problems.join(', ') : 'Всё отлично';

                const StatusIcon = statusMap[overallStatus].icon;

                return (
                  <tr
                    key={client.id}
                    className="border-b border-outline hover:bg-surface-soft transition cursor-pointer"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <td className="p-4 font-semibold text-on-background">{client.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusMap[overallStatus].className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusMap[overallStatus].label}
                      </span>
                    </td>
                    <td className={`p-4 ${cellColorClass(costColor)}`}>{formatValue(costDev, false, true)}</td>
                    <td className={`p-4 ${cellColorClass(leadsColor)}`}>{formatValue(leadsDev, false, true)}</td>
                    <td className={`p-4 ${cellColorClass(cplColor)}`}>{formatValue(cplDev, false, true)}</td>
                    <td className="p-4 text-on-surface-muted">{problemText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
