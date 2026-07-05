import { useQuery } from '@tanstack/react-query'

import { getQualifiedLeads, getUonLeads } from '../api/uon'
import { getOperationalProjectById } from '../config/operationalProjects'
import type { DateRange, UonLead } from '../types'

export function useUonLeads(projectId: string | undefined, dates: DateRange) {
  return useQuery<{ qualified: UonLead[]; total: UonLead[] }, Error>({
    queryKey: ['uonLeads', projectId, dates.from, dates.to],
    queryFn: async () => {
      if (!projectId || !dates.from || !dates.to) {
        throw new Error('Не выбран проект или период')
      }
      const project = getOperationalProjectById(projectId)
      if (!project) {
        throw new Error(`Проект ${projectId} не найден`)
      }
      if (!project.uonApiKey) {
        throw new Error(`У проекта ${project.name} не задан U-ON API ключ`)
      }

      const total = await getUonLeads(project.uonApiKey, dates.from, dates.to)
      const qualified = getQualifiedLeads(total)
      return { qualified, total }
    },
    enabled: !!projectId && !!dates.from && !!dates.to,
    retry: 3,
  })
}
