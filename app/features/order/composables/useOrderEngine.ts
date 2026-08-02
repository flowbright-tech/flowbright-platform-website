import { ref, watch } from 'vue'
import type { Order, OrderFormData, OrderItem } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

/**
 * Pure calculation and utility helpers
 */
export const safeLowerCase = (val: any): string => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val.toLowerCase()
  if (typeof val === 'number' || typeof val === 'boolean') return String(val).toLowerCase()
  if (typeof val === 'object') {
    if (val.message && typeof val.message === 'string') return val.message.toLowerCase()
    if (val.error && typeof val.error === 'string') return val.error.toLowerCase()
    try {
      return JSON.stringify(val).toLowerCase()
    } catch {
      return String(val).toLowerCase()
    }
  }
  return String(val).toLowerCase()
}

export const calculateItemSubtotal = (quantity: number, unitPrice: number): number => {
  const q = Math.max(0, Number(quantity) || 0)
  const p = Math.max(0, Number(unitPrice) || 0)
  return Number((q * p).toFixed(2))
}

export const calculateOrderSummary = (
  items: Array<{ subtotal?: number; quantity?: number; unit_price?: number }>,
  discount: number = 0,
  paymentChannel: string = '',
  creditCardChargePercent: number = 0
) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { itemsSubtotal: 0, discountAmount: 0, subtotalAfterDiscount: 0, creditCardFee: 0, totalAmount: 0 }
  }
  const itemsSubtotal = items.reduce((sum, item) => {
    const sub = item.subtotal !== undefined
      ? Number(item.subtotal) || 0
      : calculateItemSubtotal(item.quantity || 0, item.unit_price || 0)
    return sum + sub
  }, 0)

  const disc = Math.max(0, Number(discount) || 0)
  const subtotalAfterDiscount = Math.max(0, itemsSubtotal - disc)

  let creditCardFee = 0
  if (safeLowerCase(paymentChannel) === 'credit_card') {
    const feePercent = Math.max(0, Number(creditCardChargePercent) || 0)
    creditCardFee = (subtotalAfterDiscount * feePercent) / 100
  }

  const totalAmount = Number((subtotalAfterDiscount + creditCardFee).toFixed(2))

  return {
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    discountAmount: Number(disc.toFixed(2)),
    subtotalAfterDiscount: Number(subtotalAfterDiscount.toFixed(2)),
    creditCardFee: Number(creditCardFee.toFixed(2)),
    totalAmount
  }
}

export const calculateOrderTotal = (
  items: Array<{ subtotal?: number; quantity?: number; unit_price?: number }>,
  discount: number = 0,
  paymentChannel: string = '',
  creditCardChargePercent: number = 0
): number => {
  return calculateOrderSummary(items, discount, paymentChannel, creditCardChargePercent).totalAmount
}

export const getTodayDateString = (dateObj: Date = new Date()): string => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into DD-MMM-YYYY format (e.g. 19-Jul-2026)
 */
export const formatDeliveryDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  try {
    const cleanStr = dateStr.split('T')[0]
    const parts = cleanStr.split('-')
    if (parts.length === 3) {
      const year = parts[0]
      const monthIdx = parseInt(parts[1], 10) - 1
      const day = String(parseInt(parts[2], 10)).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}-${year}`
      }
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`
    }
    return dateStr
  } catch (err) {
    return dateStr
  }
}

export const useOrderEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const orders = ref<Order[]>([])
  const totalFilteredCount = ref<number>(0)
  const isLoading = ref<boolean>(false)
  const errorMsg = ref<string | null>(null)

  const searchQuery = ref('')
  const statusFilter = ref('')
  const paymentChannelFilter = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // API Call to fetch orders (list with pagination)
  const fetchOrders = async () => {
    const token = session.value?.token
    if (!token) {
      orders.value = []
      totalFilteredCount.value = 0
      return
    }

    isLoading.value = true
    errorMsg.value = null

    try {
      const searchParams = new URLSearchParams()
      searchParams.append('page', String(currentPage.value))
      searchParams.append('limit', String(pageSize.value))

      if (searchQuery.value) {
        searchParams.append('search', safeLowerCase(searchQuery.value))
      }

      const res = await apiFetch(`/api/v1/orders?${searchParams.toString()}`)

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const msg = errorJson?.message || errorJson?.error || `failed to fetch orders: ${res.status}`
        throw new Error(safeLowerCase(msg))
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        orders.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(safeLowerCase(json.message || 'api responded with success: false'))
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      errorMsg.value = safeLowerCase(err?.message || err || 'an error occurred while fetching order data')
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch single order by ID
  const fetchOrderById = async (id: string): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`)
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const msg = errorJson?.message || errorJson?.error || `failed to fetch order: ${res.status}`
        throw new Error(safeLowerCase(msg))
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(safeLowerCase(json.message || 'order not found'))
      }
    } catch (err: any) {
      console.error('Error fetching order by ID:', err)
      errorMsg.value = safeLowerCase(err?.message || err || 'an error occurred while fetching order details')
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Create Order (POST)
  const addOrder = async (data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    const paymentChannelClean = safeLowerCase(data.payment_channel || 'cash')
    const ccChargePercent = paymentChannelClean === 'credit_card'
      ? Number(data.credit_card_charge_percent ?? data.credit_card_percent_charge ?? 0)
      : 0

    const payload = {
      ...data,
      status: safeLowerCase(data.status || 'pending'),
      payment_channel: paymentChannelClean,
      discount: Number(data.discount || 0),
      credit_card_charge_percent: ccChargePercent,
      credit_card_percent_charge: ccChargePercent
    }

    try {
      const res = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const msg = errorJson?.message || errorJson?.error || `failed to create order: ${res.status}`
        throw new Error(safeLowerCase(msg))
      }

      const json = await res.json().catch(() => ({}))
      if (json && json.success !== false && (json.data || json.id)) {
        await fetchOrders()
        return json.data || json
      } else if (json && json.data) {
        await fetchOrders()
        return json.data
      } else {
        await fetchOrders()
        return json as any
      }
    } catch (err: any) {
      console.error('Error adding order:', err)
      errorMsg.value = safeLowerCase(err?.message || err || 'an error occurred while creating the order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Order (PUT)
  const updateOrder = async (id: string, data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    const paymentChannelClean = safeLowerCase(data.payment_channel || 'cash')
    const ccChargePercent = paymentChannelClean === 'credit_card'
      ? Number(data.credit_card_charge_percent ?? data.credit_card_percent_charge ?? 0)
      : 0

    const payload = {
      ...data,
      status: safeLowerCase(data.status || 'pending'),
      payment_channel: paymentChannelClean,
      discount: Number(data.discount || 0),
      credit_card_charge_percent: ccChargePercent,
      credit_card_percent_charge: ccChargePercent
    }

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const msg = errorJson?.message || errorJson?.error || `failed to update order: ${res.status}`
        throw new Error(safeLowerCase(msg))
      }

      const json = await res.json().catch(() => ({}))
      if (json && json.success !== false) {
        await fetchOrders()
        return json.data || json
      } else {
        throw new Error(safeLowerCase(json.message || 'failed to update order'))
      }
    } catch (err: any) {
      console.error('Error updating order:', err)
      errorMsg.value = safeLowerCase(err?.message || err || 'an error occurred while updating the order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Order (DELETE) with robust error & response parsing
  const deleteOrder = async (id: string): Promise<boolean> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const detailMsg = errData?.message || errData?.error || `failed to delete order: ${res.status}`
        throw new Error(safeLowerCase(detailMsg))
      }

      if (orders.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }

      await fetchOrders()
      return true
    } catch (err: any) {
      console.error('Error deleting order:', err)
      errorMsg.value = safeLowerCase(err?.message || err || 'an error occurred while deleting the order')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Auto refetch when debounced search changes
  watch(debouncedSearchQuery, () => {
    currentPage.value = 1
    fetchOrders()
  })

  // Refetch on page change
  watch(currentPage, () => {
    fetchOrders()
  })

  return {
    orders,
    totalFilteredCount,
    isLoading,
    errorMsg,
    searchQuery,
    statusFilter,
    paymentChannelFilter,
    currentPage,
    pageSize,
    fetchOrders,
    fetchOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    calculateItemSubtotal,
    calculateOrderSummary,
    calculateOrderTotal,
    getTodayDateString,
    formatDeliveryDate,
    safeLowerCase
  }
}
