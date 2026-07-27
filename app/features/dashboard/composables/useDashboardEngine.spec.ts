import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useDashboardEngine } from './useDashboardEngine'
import type { DashboardData } from '../types'

vi.mock('#imports', async (importOriginal) => {
  const actual = await importOriginal() as any
  const activeRefs = new Map()
  return {
    ...actual,
    useState: (key: string, init: () => any) => {
      if (!activeRefs.has(key)) {
        activeRefs.set(key, ref(init()))
      }
      return activeRefs.get(key)
    },
    useRuntimeConfig: () => ({
      public: {
        apiDomain: 'https://flowbright-platform-api.onrender.com'
      }
    }),
    useToast: () => ({
      add: vi.fn()
    }),
    useI18n: () => ({
      t: (key: string) => key,
      te: () => false
    })
  }
})

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Dashboard Analytics Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide 4 default executive metrics', () => {
    const { metrics } = useDashboardEngine()
    expect(metrics.value.length).toBe(4)
  })

  it('should correctly format currency values', () => {
    const { formatCurrency } = useDashboardEngine()
    const formatted = formatCurrency(23700)
    expect(formatted).toContain('23,700')
  })

  it('should calculate current financial metrics for dashboard', () => {
    const { dashboardData, currentFinancial } = useDashboardEngine()
    const mockData: DashboardData = {
      financial: {
        daily: { net_revenue: 100, total_cost: 20, total_profit: 80, total_orders: 1 },
        monthly: { net_revenue: 23700, total_cost: 800, total_profit: 22900, total_orders: 5 },
        yearly: { net_revenue: 23700, total_cost: 800, total_profit: 22900, total_orders: 5 },
        by_date: [],
        by_month: []
      },
      customers: { total: 6, daily: 0, monthly: 3, yearly: 6, by_date: [], by_month: [] },
      orders: { pending_orders: 4, daily_orders: 0, total_orders: 5 },
      forecast_trend: [],
      top_sales_packages: [],
      low_stock_items: []
    }

    dashboardData.value = mockData
    expect(currentFinancial.value.net_revenue).toBe(23700)
    expect(currentFinancial.value.total_profit).toBe(22900)
  })
})
