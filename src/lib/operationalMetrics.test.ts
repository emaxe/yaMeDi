import {
  calculateAverageCheck,
  calculateCpa,
  calculateDrr,
  calculateRomi,
  calculateC1,
  calculateC2,
  calculateC3,
  calculateOperationalMetrics,
} from './operationalMetrics'

describe('calculateAverageCheck', () => {
  it('returns revenue divided by orders', () => {
    expect(calculateAverageCheck(100000, 50)).toBe(2000)
  })

  it('returns 0 when orders are 0', () => {
    expect(calculateAverageCheck(100000, 0)).toBe(0)
  })
})

describe('calculateCpa', () => {
  it('returns cost divided by conversions', () => {
    expect(calculateCpa(50000, 25)).toBe(2000)
  })

  it('returns 0 when conversions are 0', () => {
    expect(calculateCpa(50000, 0)).toBe(0)
  })
})

describe('calculateDrr', () => {
  it('returns cost divided by revenue as a ratio', () => {
    expect(calculateDrr(50000, 200000)).toBe(0.25)
  })

  it('returns 0 when revenue is 0', () => {
    expect(calculateDrr(50000, 0)).toBe(0)
  })
})

describe('calculateRomi', () => {
  it('returns (revenue - cost) / cost as a ratio', () => {
    expect(calculateRomi(50000, 200000)).toBe(3)
  })

  it('returns 0 when cost is 0', () => {
    expect(calculateRomi(0, 200000)).toBe(0)
  })
})

describe('calculateC1', () => {
  it('returns cart events divided by visits', () => {
    expect(calculateC1(275, 10000)).toBe(0.0275)
  })

  it('returns 0 when visits are 0', () => {
    expect(calculateC1(275, 0)).toBe(0)
  })
})

describe('calculateC2', () => {
  it('returns orders divided by visits', () => {
    expect(calculateC2(71, 10000)).toBe(0.0071)
  })

  it('returns 0 when visits are 0', () => {
    expect(calculateC2(71, 0)).toBe(0)
  })
})

describe('calculateC3', () => {
  it('returns orders divided by cart events', () => {
    expect(calculateC3(71, 275)).toBe(0.2581818181818182)
  })

  it('returns 0 when cart events are 0', () => {
    expect(calculateC3(71, 0)).toBe(0)
  })
})

describe('calculateOperationalMetrics', () => {
  it('calculates all operational metrics from raw API data', () => {
    const raw = {
      revenue: 1_000_000,
      orders: 100,
      visits: 10_000,
      totalCost: 100_000,
      totalConversions: 50,
      directRevenue: 500_000,
      directOrders: 50,
      directCost: 100_000,
      directConversions: 50,
      seoRevenue: 300_000,
      seoOrders: 30,
      seoVisits: 10_000,
      cartEvents: 275,
      leads: 500,
    }

    const result = calculateOperationalMetrics(raw)

    expect(result.revenue).toBe(raw.revenue)
    expect(result.orders).toBe(raw.orders)
    expect(result.averageCheck).toBe(10_000)
    expect(result.cpa).toBe(2_000)
    expect(result.drr).toBe(0.1)
    expect(result.romi).toBe(9)
    expect(result.directRevenue).toBe(raw.directRevenue)
    expect(result.directOrders).toBe(raw.directOrders)
    expect(result.directAverageCheck).toBe(10_000)
    expect(result.directCpa).toBe(2_000)
    expect(result.seoRevenue).toBe(raw.seoRevenue)
    expect(result.seoOrders).toBe(raw.seoOrders)
    expect(result.seoAverageCheck).toBe(10_000)
    expect(result.seoTraffic).toBe(raw.seoVisits)
    expect(result.c1).toBe(0.0275)
    expect(result.c2).toBe(0.01)
    expect(result.c3).toBe(100 / 275)
    expect(result.leads).toBe(raw.leads)
  })

  it('handles zero values without division errors', () => {
    const raw = {
      revenue: 0,
      orders: 0,
      visits: 0,
      totalCost: 0,
      totalConversions: 0,
      directRevenue: 0,
      directOrders: 0,
      directCost: 0,
      directConversions: 0,
      seoRevenue: 0,
      seoOrders: 0,
      seoVisits: 0,
      cartEvents: 0,
      leads: 0,
    }

    const result = calculateOperationalMetrics(raw)

    expect(result.averageCheck).toBe(0)
    expect(result.cpa).toBe(0)
    expect(result.drr).toBe(0)
    expect(result.romi).toBe(0)
    expect(result.directAverageCheck).toBe(0)
    expect(result.directCpa).toBe(0)
    expect(result.seoAverageCheck).toBe(0)
    expect(result.c1).toBe(0)
    expect(result.c2).toBe(0)
    expect(result.c3).toBe(0)
  })
})
