export type ReportPreset = 'today' | 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days'

export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface ReportItem {
  id: string
  titleKey: string
  descKey: string
  icon: string
  badgeText: string
  color: 'primary' | 'success' | 'warning' | 'info' | 'neutral'
}
