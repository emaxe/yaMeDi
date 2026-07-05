import { useQuery } from '@tanstack/react-query'

import { getOverallCampaignReport } from '../api/direct'
import {
  getContactLeads,
  getDailyOrganicSummary,
  getDailySourceEcommerceSummary,
  getEcommerceSummary,
  getFunnelSummary,
  getLeadRequests,
  getTrafficSummary,
} from '../api/metrica'
import { getQualifiedLeads, getUonLeads, type UonLead } from '../api/uon'
import { getOperationalProjectById } from '../config/operationalProjects'
import { buildOperationalReportData, type OperationalReportData } from '../lib/operationalReport'
import type { DateRange } from '../types'

import { useAuth } from './useAuth'

export function useOperationalReport(projectId: string | undefined, dates: DateRange, sandbox = false) {
  const { token, clientLogin } = useAuth()

  return useQuery<OperationalReportData, Error>({
    queryKey: ['operationalReport', projectId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: async () => {
      if (!projectId || !token || !dates.from || !dates.to) {
        throw new Error('Не выбран проект или период')
      }
      const project = getOperationalProjectById(projectId)
      if (!project) {
        throw new Error(`Проект ${projectId} не найден`)
      }
      if (!project.contactGoalId) {
        throw new Error(`У проекта ${project.name} не задана цель «Собрано контактов»`)
      }

      const directLogin = project.directClientLogin || clientLogin
      const hasLeadGoals = project.leadGoalIds && project.leadGoalIds.length > 0
      const hasUon = !!project.uonApiKey

      const [ecommerce, traffic, funnel, leads, sourceEcommerce, organic, directRows, leadRequests] = await Promise.all([
        getEcommerceSummary(token, project.counterId, dates.from, dates.to, project.purchasesMetric),
        getTrafficSummary(token, project.counterId, dates.from, dates.to),
        getFunnelSummary(token, project.counterId, dates.from, dates.to, {
          purchasesMetric: project.purchasesMetric,
          addToCartMetric: project.addToCartMetric,
          cartGoalId: project.cartGoalId,
          orderGoalId: project.orderGoalId,
        }),
        getContactLeads(token, project.counterId, dates.from, dates.to, project.contactGoalId),
        getDailySourceEcommerceSummary(token, project.counterId, dates.from, dates.to, project.purchasesMetric),
        getDailyOrganicSummary(token, project.counterId, dates.from, dates.to, project.purchasesMetric),
        getOverallCampaignReport(token, directLogin, dates.from, dates.to, sandbox),
        hasLeadGoals
          ? getLeadRequests(token, project.counterId, dates.from, dates.to, project.leadGoalIds!)
          : Promise.resolve(undefined),
      ])

      let uonResult: UonLead[] | undefined
      let uonError: string | undefined
      if (hasUon) {
        try {
          uonResult = await getUonLeads(project.uonApiKey!, dates.from, dates.to).then(getQualifiedLeads)
        } catch (err) {
          uonError = err instanceof Error ? err.message : 'Ошибка загрузки данных U-ON'
        }
      }

      return buildOperationalReportData(
        dates,
        project,
        ecommerce,
        traffic,
        funnel,
        leads,
        sourceEcommerce,
        organic,
        directRows,
        leadRequests,
        uonResult,
        uonError
      )
    },
    enabled: !!projectId && !!token && !!dates.from && !!dates.to,
  })
}
