export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
export type PaymentChannel = 'bank_transfer' | 'promptpay' | 'credit_card' | 'cash'

export interface OrderItem {
  id?: string
  package_id: string
  quantity: number
  unit_price: number
  subtotal: number
  notes: string
  // Display metadata resolved from backend or package lookup
  package_name_en?: string
  package_name_th?: string
  package_price?: number
  package_image?: string
}

export interface Order {
  id: string
  company_id?: string
  order_number?: string
  code?: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_date: string // YYYY-MM-DD
  payment_channel: PaymentChannel | string
  status: OrderStatus | string
  total_amount: number
  notes: string
  items: OrderItem[]
  created_at?: string
  updated_at?: string
}

export interface OrderFormData {
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_date: string // YYYY-MM-DD
  payment_channel: string
  status: string
  notes: string
  total_amount: number
  items: Array<{
    package_id: string
    quantity: number
    unit_price: number
    subtotal: number
    notes: string
    // Display metadata for local component rendering
    package_name_en?: string
    package_name_th?: string
  }>
}

export interface OrderFilterState {
  search: string
  status: string
  payment_channel: string
  page: number
  limit: number
}
