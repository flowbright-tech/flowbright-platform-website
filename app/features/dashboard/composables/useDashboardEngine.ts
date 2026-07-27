import { ref, computed, watch, onMounted } from 'vue'
import { useState } from '#imports'
import type { DashboardData, DashboardMetric, FinancialPeriodMetrics, FinancialByDate } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useApiFetch } from '../../../composables/useApiFetch'

export const useDashboardEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  const dashboardData = useState<DashboardData | null>('srp_dashboard_data', () => null)
  const isLoading = useState<boolean>('srp_dashboard_loading', () => false)
  const errorMsg = useState<string | null>('srp_dashboard_error', () => null)
  const selectedPeriod = ref<'daily' | 'monthly' | 'yearly'>('monthly')

  const fetchDashboard = async () => {
    const token = session.value?.token
    if (!token) {
      dashboardData.value = null
      return
    }

    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/dashboard')
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard metrics: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        dashboardData.value = json.data
      } else {
        throw new Error(json.message || 'API returned unexpected payload structure')
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      errorMsg.value = err.message || 'An error occurred while loading executive dashboard'
    } finally {
      isLoading.value = false
    }
  }

  // Selected period financial metrics getter
  const currentFinancial = computed<FinancialPeriodMetrics>(() => {
    if (!dashboardData.value?.financial) {
      return { net_revenue: 0, total_cost: 0, total_profit: 0, total_orders: 0 }
    }
    return dashboardData.value.financial[selectedPeriod.value] || dashboardData.value.financial.monthly
  })

  // Daily by_date records
  const dailyFinancialRecords = computed<FinancialByDate[]>(() => {
    return dashboardData.value?.financial?.by_date || []
  })

  // Format THB currency
  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  // Key metrics for top metric cards
  const metrics = computed<DashboardMetric[]>(() => {
    const fin = currentFinancial.value
    const cust = dashboardData.value?.customers
    const ord = dashboardData.value?.orders

    return [
      {
        id: 'net_revenue',
        key: 'net_revenue',
        value: formatCurrency(fin.net_revenue),
        subText: `Cost: ${formatCurrency(fin.total_cost)}`,
        icon: 'i-heroicons-banknotes',
        color: 'emerald'
      },
      {
        id: 'total_profit',
        key: 'total_profit',
        value: formatCurrency(fin.total_profit),
        subText: `${fin.total_orders} Completed Orders`,
        icon: 'i-heroicons-chart-bar',
        color: 'indigo'
      },
      {
        id: 'orders_summary',
        key: 'orders_summary',
        value: String(ord?.total_orders ?? 0),
        subText: `${ord?.pending_orders ?? 0} Pending`,
        icon: 'i-heroicons-shopping-bag',
        color: 'amber'
      },
      {
        id: 'customer_total',
        key: 'customer_total',
        value: String(cust?.total ?? 0),
        subText: `+${cust?.monthly ?? 0} this month`,
        icon: 'i-heroicons-user-group',
        color: 'sky'
      }
    ]
  })

  // Client lifecycle fetching & watchers
  if (import.meta.client) {
    onMounted(() => {
      // Always call /api/v1/dashboard when accessing dashboard page
      fetchDashboard()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        fetchDashboard()
      } else {
        dashboardData.value = null
      }
    })
  }

  return {
    dashboardData,
    isLoading,
    errorMsg,
    selectedPeriod,
    currentFinancial,
    dailyFinancialRecords,
    metrics,
    fetchDashboard,
    formatCurrency
  }
}
