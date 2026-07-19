import { ref, watch } from 'vue'
import type { Order, OrderFormData, OrderItem } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

/**
 * Pure calculation and utility helpers
 */
export const calculateItemSubtotal = (quantity: number, unitPrice: number): number => {
  const q = Math.max(0, Number(quantity) || 0)
  const p = Math.max(0, Number(unitPrice) || 0)
  return Number((q * p).toFixed(2))
}

export const calculateOrderTotal = (
  items: Array<{ subtotal?: number; quantity?: number; unit_price?: number }>
): number => {
  if (!Array.isArray(items) || items.length === 0) return 0
  const total = items.reduce((sum, item) => {
    const sub = item.subtotal !== undefined
      ? Number(item.subtotal) || 0
      : calculateItemSubtotal(item.quantity || 0, item.unit_price || 0)
    return sum + sub
  }, 0)
  return Number(total.toFixed(2))
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

  // API Call to fetch orders (list with pagination & status filters)
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
        searchParams.append('search', searchQuery.value.toLowerCase())
      }
      if (statusFilter.value) {
        searchParams.append('status', statusFilter.value.toLowerCase())
      }
      if (paymentChannelFilter.value) {
        searchParams.append('payment_channel', paymentChannelFilter.value.toLowerCase())
      }

      const res = await apiFetch(`/api/v1/orders?${searchParams.toString()}`)

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.message?.toLowerCase() || `failed to fetch orders: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        orders.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error((json.message || 'api responded with success: false').toLowerCase())
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      errorMsg.value = (err.message || 'an error occurred while fetching order data').toLowerCase()
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
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.message?.toLowerCase() || `failed to fetch order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error((json.message || 'order not found').toLowerCase())
      }
    } catch (err: any) {
      console.error('Error fetching order by ID:', err)
      errorMsg.value = (err.message || 'an error occurred while fetching order details').toLowerCase()
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Create Order (POST)
  const addOrder = async (data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    const payload = {
      ...data,
      status: (data.status || 'pending').toLowerCase(),
      payment_channel: (data.payment_channel || 'cash').toLowerCase()
    }

    try {
      const res = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.message?.toLowerCase() || `failed to create order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        await fetchOrders()
        return json.data
      } else {
        throw new Error((json.message || 'failed to create order').toLowerCase())
      }
    } catch (err: any) {
      console.error('Error adding order:', err)
      errorMsg.value = (err.message || 'an error occurred while creating the order').toLowerCase()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Order (PUT)
  const updateOrder = async (id: string, data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    const payload = {
      ...data,
      status: (data.status || 'pending').toLowerCase(),
      payment_channel: (data.payment_channel || 'cash').toLowerCase()
    }

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.message?.toLowerCase() || `failed to update order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        await fetchOrders()
        return json.data
      } else {
        throw new Error((json.message || 'failed to update order').toLowerCase())
      }
    } catch (err: any) {
      console.error('Error updating order:', err)
      errorMsg.value = (err.message || 'an error occurred while updating the order').toLowerCase()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Order (DELETE) with robust JSON error parsing
  const deleteOrder = async (id: string): Promise<boolean> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'DELETE'
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const detailMsg = json?.message || json?.error || `failed to delete order: ${res.status}`
        throw new Error(String(detailMsg).toLowerCase())
      }

      if (json && json.success !== false) {
        await fetchOrders()
        return true
      } else {
        const failMsg = json?.message || 'failed to delete order'
        throw new Error(String(failMsg).toLowerCase())
      }
    } catch (err: any) {
      console.error('Error deleting order:', err)
      errorMsg.value = (err.message || 'an error occurred while deleting the order').toLowerCase()
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Auto refetch when debounced search or filters change
  watch([debouncedSearchQuery, statusFilter, paymentChannelFilter], () => {
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
    calculateOrderTotal,
    getTodayDateString,
    formatDeliveryDate
  }
}
