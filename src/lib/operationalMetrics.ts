export interface OperationalRawData {
  revenue: number
  orders: number
  visits: number
  totalCost: number
  totalConversions: number
  directRevenue: number
  directOrders: number
  directCost: number
  directConversions: number
  seoRevenue: number
  seoOrders: number
  seoVisits: number
  cartEvents: number
  leads: number
}

export interface OperationalMetrics extends OperationalRawData {
  averageCheck: number
  cpa: number
  drr: number
  romi: number
  directAverageCheck: number
  directCpa: number
  seoAverageCheck: number
  seoTraffic: number
  c1: number
  c2: number
  c3: number
}

export function calculateAverageCheck(revenue: number, orders: number): number {
  if (orders === 0) return 0
  return revenue / orders
}

export function calculateCpa(cost: number, conversions: number): number {
  if (conversions === 0) return 0
  return cost / conversions
}

export function calculateDrr(cost: number, revenue: number): number {
  if (revenue === 0) return 0
  return cost / revenue
}

export function calculateRomi(cost: number, revenue: number): number {
  if (cost === 0) return 0
  return (revenue - cost) / cost
}

export function calculateC1(cartEvents: number, visits: number): number {
  if (visits === 0) return 0
  return cartEvents / visits
}

export function calculateC2(orders: number, visits: number): number {
  if (visits === 0) return 0
  return orders / visits
}

export function calculateC3(orders: number, cartEvents: number): number {
  if (cartEvents === 0) return 0
  return orders / cartEvents
}

export function calculateOperationalMetrics(raw: OperationalRawData): OperationalMetrics {
  return {
    ...raw,
    averageCheck: calculateAverageCheck(raw.revenue, raw.orders),
    cpa: calculateCpa(raw.totalCost, raw.totalConversions),
    drr: calculateDrr(raw.totalCost, raw.revenue),
    romi: calculateRomi(raw.totalCost, raw.revenue),
    directAverageCheck: calculateAverageCheck(raw.directRevenue, raw.directOrders),
    directCpa: calculateCpa(raw.directCost, raw.directConversions),
    seoAverageCheck: calculateAverageCheck(raw.seoRevenue, raw.seoOrders),
    seoTraffic: raw.seoVisits,
    c1: calculateC1(raw.cartEvents, raw.visits),
    c2: calculateC2(raw.orders, raw.visits),
    c3: calculateC3(raw.orders, raw.cartEvents),
  }
}
