import { getOperationalProjectById, OPERATIONAL_PROJECTS } from './operationalProjects'

describe('operationalProjects', () => {
  it('contains all current projects', () => {
    const ids = OPERATIONAL_PROJECTS.map((p) => p.id)
    expect(ids).toContain('kuroort26')
    expect(ids).toContain('istok')
    expect(ids).toContain('belayarus')
  })

  it('returns project by id', () => {
    const project = getOperationalProjectById('kuroort26')
    expect(project).toBeDefined()
    expect(project?.name).toBe('Курорт 26')
    expect(project?.purchasesMetric).toBe('ym:s:ecommercePurchases')
    expect(project?.cartGoalId).toBe(249520697)
  })

  it('uses unified goal-based funnel for all projects', () => {
    for (const project of OPERATIONAL_PROJECTS) {
      expect(project.purchasesMetric).toBe('ym:s:ecommercePurchases')
      expect(project.cartGoalId).toBeDefined()
      expect(project.orderGoalId).toBeDefined()
    }
  })

  it('returns undefined for unknown id', () => {
    expect(getOperationalProjectById('unknown')).toBeUndefined()
  })
})
