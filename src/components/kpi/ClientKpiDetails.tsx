import { useMemo, useState } from 'react';
import { ClientKpi, KpiData } from '../../types/kpi.types';
import { formatValue } from '../../lib/kpi-utils';
import { Settings2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Download } from 'lucide-react';
import { exportElementToPdf } from '../../lib/pdfExport';

interface Props {
  client: ClientKpi;
  onUpdateKpi?: (kpi: KpiData) => void;
}

export function ClientKpiDetails({ client, onUpdateKpi }: Props) {
  const [isEditingKpi, setIsEditingKpi] = useState(false);
  const [kpiForm, setKpiForm] = useState<KpiData>(client.kpi);
  const chartData = useMemo(() => {
    return client.weeklyFacts.map(fact => ({
      week: fact.week,
      costFact: fact.cost,
      leadsFact: fact.leads,
      cplFact: fact.cpl,
      clicks: fact.clicks,
      ctr: fact.ctr,
      conversion: fact.conversionRate,
      costKpi: client.kpi.cost,
      leadsKpi: client.kpi.leads,
      cplKpi: client.kpi.cpl,
    }));
  }, [client]);

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e3e0dd',
    borderRadius: '8px',
    color: '#423d38',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
  };
  
  const gridStroke = '#e3e0dd';
  const axisStroke = '#797067';

  const handleKpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKpi?.(kpiForm);
    setIsEditingKpi(false);
  };

  const handleExportPdf = () => {
    exportElementToPdf(`kpi-details-${client.id}`, `Отчет_Сводка_KPI_${client.name}.pdf`);
  };

  return (
    <div id={`kpi-details-${client.id}`} className="space-y-8 pb-12 bg-background">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-headline-lg text-on-background">{client.name}</h2>
          <p className="text-body-md text-on-surface-muted mt-1">Детализация по неделям и рекламным кампаниям</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-export flex-wrap xl:justify-end">
          <button
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition w-full xl:w-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            Получить отчет
          </button>
          <button
            onClick={() => setIsEditingKpi(!isEditingKpi)}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-on-background bg-surface-elevated border border-outline rounded-lg hover:bg-surface shadow-subtle transition w-full sm:w-auto whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4 shrink-0" />
            Настроить KPI
          </button>
        </div>
      </div>

      {isEditingKpi && (
        <div className="bg-surface-elevated border border-outline shadow-subtle p-5 rounded-lg animate-in fade-in slide-in-from-top-2">
          <h3 className="text-title-md text-on-background mb-4">Настройки KPI (План)</h3>
          <form onSubmit={handleKpiSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="block text-label-sm text-on-surface-muted">Расход (₽)</label>
              <input 
                type="number" 
                value={kpiForm.cost} 
                onChange={(e) => setKpiForm({...kpiForm, cost: Number(e.target.value)})}
                className="w-32 h-9 px-3 bg-surface border border-outline rounded text-sm text-on-background focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-label-sm text-on-surface-muted">Заявки</label>
              <input 
                type="number" 
                value={kpiForm.leads} 
                onChange={(e) => setKpiForm({...kpiForm, leads: Number(e.target.value)})}
                className="w-32 h-9 px-3 bg-surface border border-outline rounded text-sm text-on-background focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-label-sm text-on-surface-muted">Цена заявки (₽)</label>
              <input 
                type="number" 
                value={kpiForm.cpl} 
                onChange={(e) => setKpiForm({...kpiForm, cpl: Number(e.target.value)})}
                className="w-32 h-9 px-3 bg-surface border border-outline rounded text-sm text-on-background focus:outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="h-9 px-4 bg-primary hover:bg-primary-strong text-white text-sm font-semibold rounded transition shadow-sm">
              Сохранить
            </button>
          </form>
        </div>
      )}

      {client.weeklyFacts.length === 0 ? (
        <div className="bg-surface-elevated border border-outline rounded-lg p-12 text-center text-on-surface-muted shadow-subtle">
          За выбранный период статистика в Директе не найдена.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Chart */}
        <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle p-5">
          <h3 className="text-title-md text-on-background mb-4">Динамика расхода</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(val: number) => formatValue(val, true)} />
                <Legend />
                <Bar dataKey="costFact" name="Расход (Факт)" fill="#fe6e00" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                <ReferenceLine y={client.kpi.cost} label="KPI" stroke="#00c758" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Chart */}
        <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle p-5">
          <h3 className="text-title-md text-on-background mb-4">Динамика заявок</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="leadsFact" name="Заявки (Факт)" stroke="#3080ff" strokeWidth={3} dot={{ r: 4 }} />
                <ReferenceLine y={client.kpi.leads} label="KPI" stroke="#00c758" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPL Chart */}
        <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle p-5">
          <h3 className="text-title-md text-on-background mb-4">Динамика цены заявки (CPL)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(val: number) => formatValue(val, true)} />
                <Legend />
                <Line type="monotone" dataKey="cplFact" name="CPL (Факт)" stroke="#fb2c36" strokeWidth={3} dot={{ r: 4 }} />
                <ReferenceLine y={client.kpi.cpl} label="KPI" stroke="#00c758" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clicks & CTR */}
        <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle p-5">
          <h3 className="text-title-md text-on-background mb-4">Клики и CTR</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" stroke={axisStroke} fontSize={12} />
                <YAxis yAxisId="left" stroke={axisStroke} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke={axisStroke} fontSize={12} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="clicks" name="Клики" fill="#3080ff" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#fe6e00" strokeWidth={3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      )}

      {client.weeklyFacts.length > 0 && client.campaigns.length > 0 && (
        <div className="bg-surface-elevated rounded-lg border border-outline shadow-subtle overflow-hidden mt-8">
          <div className="p-5 border-b border-outline">
            <h3 className="text-title-md text-on-background">Анализ кампаний</h3>
            <p className="text-body-md text-on-surface-muted mt-1">Детализация для поиска точек роста и утечек бюджета</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline bg-surface text-label-sm font-semibold text-on-surface-muted uppercase tracking-wider">
                  <th className="p-4">Кампания</th>
                  <th className="p-4">Расход</th>
                  <th className="p-4">Заявки</th>
                  <th className="p-4">CPL</th>
                  <th className="p-4">CTR (%)</th>
                  <th className="p-4">Конверсия (%)</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-on-background">
                {client.campaigns.map((camp) => (
                  <tr key={camp.id} className="border-b border-outline hover:bg-surface-soft transition">
                    <td className="p-4 font-semibold text-on-background">{camp.name}</td>
                    <td className="p-4">{formatValue(camp.cost, true)}</td>
                    <td className="p-4">{camp.leads}</td>
                    <td className={`p-4 font-semibold ${camp.cpl > client.kpi.cpl ? 'text-danger' : 'text-success'}`}>
                      {formatValue(camp.cpl, true)}
                    </td>
                    <td className="p-4">{camp.ctr.toFixed(1)}%</td>
                    <td className="p-4">{camp.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
