export interface FinancialPeriodMetrics {
  net_revenue: number
  total_cost: number
  total_profit: number
  total_orders: number
}

export interface FinancialByDate extends FinancialPeriodMetrics {
  date: string
}

export interface FinancialByMonth extends FinancialPeriodMetrics {
  month: string
}

export interface FinancialSummary {
  daily: FinancialPeriodMetrics
  monthly: FinancialPeriodMetrics
  yearly: FinancialPeriodMetrics
  by_date: FinancialByDate[]
  by_month: FinancialByMonth[]
}

export interface CustomerByDate {
  date: string
  total_customers: number
}

export interface CustomerByMonth {
  month: string
  total_customers: number
}

export interface CustomerSummary {
  total: number
  daily: number
  monthly: number
  yearly: number
  by_date: CustomerByDate[]
  by_month: CustomerByMonth[]
}

export interface OrderSummary {
  pending_orders: number
  daily_orders: number
  total_orders: number
}

export interface ForecastTrendItem {
  period: string
  actual_revenue: number
  forecast_revenue: number
}

export interface TopSalesPackage {
  package_id: string
  package_name: string
  quantity_sold: number
  total_revenue: number
}

export interface LowStockItem {
  id: string
  name: string
  entity_type: 'product' | 'bom_item' | string
  stock: number
  reserve_stock: number
  unit: string
}

export interface DashboardData {
  financial: FinancialSummary
  customers: CustomerSummary
  orders: OrderSummary
  forecast_trend: ForecastTrendItem[]
  top_sales_packages: TopSalesPackage[]
  low_stock_items: LowStockItem[]
}

export interface DashboardApiResponse {
  success: boolean
  statusCode: number
  data: DashboardData
  error?: Record<string, any>
}

export interface DashboardMetric {
  id: string
  key: string
  value: string | number
  subText?: string
  change?: string
  isPositive?: boolean
  icon: string
  color?: string
}
