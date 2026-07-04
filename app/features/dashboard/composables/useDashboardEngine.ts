import { ref, computed } from 'vue'
import type { DashboardMetric, ChartDataPoint, ActivityItem } from '../types'

export const useDashboardEngine = () => {
  const chartData = ref<ChartDataPoint[]>([
    { month: 'Jan', revenue: 450000, target: 400000 },
    { month: 'Feb', revenue: 520000, target: 450000 },
    { month: 'Mar', revenue: 490000, target: 480000 },
    { month: 'Apr', revenue: 610000, target: 500000 },
    { month: 'May', revenue: 580000, target: 520000 },
    { month: 'Jun', revenue: 740000, target: 600000 },
    { month: 'Jul', revenue: 820000, target: 650000 }
  ])

  const activities = ref<ActivityItem[]>([
    {
      id: 'act-101',
      type: 'invoice',
      title: 'INV-2026-089 Issued to Siam Retail Group',
      timestamp: '10 mins ago',
      amount: '฿125,000',
      status: 'completed'
    },
    {
      id: 'act-102',
      type: 'vendor',
      title: 'PO-2026-044 Confirmed with Apex Logistics',
      timestamp: '45 mins ago',
      amount: '฿340,000',
      status: 'pending'
    },
    {
      id: 'act-103',
      type: 'customer',
      title: 'New Enterprise Client: TechNordic TH Registered',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 'act-104',
      type: 'invoice',
      title: 'Payment Overdue Notice: INV-2026-032',
      timestamp: '4 hours ago',
      amount: '฿89,500',
      status: 'warning'
    }
  ])

  const metrics = computed<DashboardMetric[]>(() => [
    {
      id: 'm1',
      key: 'total_revenue',
      value: '฿4,210,000',
      change: '+18.4%',
      isPositive: true,
      icon: 'i-heroicons-banknotes'
    },
    {
      id: 'm2',
      key: 'customer_growth',
      value: '142',
      change: '+12.5%',
      isPositive: true,
      icon: 'i-heroicons-user-group'
    },
    {
      id: 'm3',
      key: 'open_invoices',
      value: '28',
      change: '-4.2%',
      isPositive: true,
      icon: 'i-heroicons-document-text',
      unitKey: 'invoices_unit'
    },
    {
      id: 'm4',
      key: 'vendor_orders',
      value: '19',
      change: '+8.1%',
      isPositive: true,
      icon: 'i-heroicons-shopping-cart',
      unitKey: 'orders_unit'
    }
  ])

  const calculateTotalRevenue = () => {
    return chartData.value.reduce((acc, item) => acc + item.revenue, 0)
  }

  return {
    metrics,
    chartData,
    activities,
    calculateTotalRevenue
  }
}
