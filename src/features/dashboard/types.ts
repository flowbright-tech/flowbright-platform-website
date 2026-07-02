export interface DashboardMetric {
  id: string
  key: string
  value: string | number
  change: string
  isPositive: boolean
  icon: string
  unitKey?: string
}

export interface ChartDataPoint {
  month: string
  revenue: number
  target: number
}

export interface ActivityItem {
  id: string
  type: 'invoice' | 'vendor' | 'customer'
  title: string
  timestamp: string
  amount?: string
  status: 'completed' | 'pending' | 'warning'
}
