import { ref, watch } from 'vue'
import { useState } from '#imports'
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

export const useOrderEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const orders = useState<Order[]>('srp_orders_list', () => [])
  const totalFilteredCount = useState<number>('srp_orders_total', () => 0)
  const isLoading = useState<boolean>('srp_orders_loading', () => false)
  const errorMsg = useState<string | null>('srp_orders_error', () => null)

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
        searchParams.append('search', searchQuery.value)
      }
      if (statusFilter.value) {
        searchParams.append('status', statusFilter.value)
      }
      if (paymentChannelFilter.value) {
        searchParams.append('payment_channel', paymentChannelFilter.value)
      }

      const res = await apiFetch(`/api/v1/orders?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        orders.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      errorMsg.value = err.message || 'An error occurred while fetching order data'
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
        throw new Error(`Failed to fetch order: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Order not found')
      }
    } catch (err: any) {
      console.error('Error fetching order by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching order details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Create Order (POST)
  const addOrder = async (data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        throw new Error(errorJson.message || `Failed to create order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        await fetchOrders()
        return json.data
      } else {
        throw new Error(json.message || 'Failed to create order')
      }
    } catch (err: any) {
      console.error('Error adding order:', err)
      errorMsg.value = err.message || 'An error occurred while creating the order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Order (PUT)
  const updateOrder = async (id: string, data: OrderFormData): Promise<Order | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        throw new Error(errorJson.message || `Failed to update order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        await fetchOrders()
        return json.data
      } else {
        throw new Error(json.message || 'Failed to update order')
      }
    } catch (err: any) {
      console.error('Error updating order:', err)
      errorMsg.value = err.message || 'An error occurred while updating the order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Order (DELETE)
  const deleteOrder = async (id: string): Promise<boolean> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/orders/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        throw new Error(errorJson.message || `Failed to delete order: ${res.status}`)
      }

      const json = await res.json()
      if (json.success) {
        await fetchOrders()
        return true
      } else {
        throw new Error(json.message || 'Failed to delete order')
      }
    } catch (err: any) {
      console.error('Error deleting order:', err)
      errorMsg.value = err.message || 'An error occurred while deleting the order'
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
    getTodayDateString
  }
}
