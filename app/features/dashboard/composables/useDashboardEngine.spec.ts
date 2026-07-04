import { describe, it, expect } from 'vitest'
import { useDashboardEngine } from './useDashboardEngine'

describe('Dashboard Analytics Engine', () => {
  it('should provide 4 executive metrics', () => {
    const { metrics } = useDashboardEngine()
    expect(metrics.value.length).toBe(4)
  })

  it('should accurately compute total revenue aggregates', () => {
    const { calculateTotalRevenue } = useDashboardEngine()
    const total = calculateTotalRevenue()
    expect(total).toBe(4210000)
  })
})
