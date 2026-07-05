import { ref, watch } from 'vue'
import { useState, useRuntimeConfig } from '#imports'
import type { Customer, CustomerFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'

export const useCustomerEngine = () => {
  const { session, logout } = useAuthEngine()
  const config = useRuntimeConfig()
  const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'

  // State refs
  const customers = useState<Customer[]>('srp_customers_list', () => [])
  const totalFilteredCount = useState<number>('srp_customers_total', () => 0)
  const isLoading = useState<boolean>('srp_customers_loading', () => false)
  const errorMsg = useState<string | null>('srp_customers_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Centralized fetch wrapper to handle auth headers and token expiration intercepting (401/403)
  const apiFetch = async (path: string, options: RequestInit = {}) => {
    let token = session.value?.token
    if (!token) {
      throw new Error('Authentication required')
    }

    const makeRequest = async (activeToken: string) => {
      const headers = {
        'Authorization': `Bearer ${activeToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
      return await fetch(`${apiDomain}${path}`, {
        method: 'GET',
        ...options,
        headers
      })
    }

    let res = await makeRequest(token)

    if (res.status === 401 || res.status === 403) {
      const { refreshSessionToken, logout } = useAuthEngine()
      const newToken = await refreshSessionToken()
      if (newToken) {
        // Retry the original request with the fresh token
        res = await makeRequest(newToken)
      } else {
        // Refresh failed, clear session and log out
        await logout()
        if (import.meta.client) {
          window.location.href = '/login'
        }
        throw new Error('Session expired. Logging out...')
      }
    }

    return res
  }

  // API Call to fetch customers (list)
  const fetchCustomers = async () => {
    const token = session.value?.token
    if (!token) {
      customers.value = []
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

      const res = await apiFetch(`/api/v1/customers?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch customers: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        customers.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err)
      errorMsg.value = err.message || 'An error occurred while fetching customer data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch a single customer details by ID
  const fetchCustomerById = async (id: string): Promise<Customer | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/customers/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch customer: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Customer not found')
      }
    } catch (err: any) {
      console.error('Error fetching customer by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching customer details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add Customer (POST)
  const addCustomer = async (data: CustomerFormData) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/customers', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create customer: ${res.status}`)
      }

      // Reset page to 1 on new addition and reload
      currentPage.value = 1
      await fetchCustomers()
    } catch (err: any) {
      console.error('Error adding customer:', err)
      errorMsg.value = err.message || 'Failed to create customer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Customer (PUT)
  const updateCustomer = async (id: string, data: Partial<CustomerFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update customer: ${res.status}`)
      }

      await fetchCustomers()
    } catch (err: any) {
      console.error('Error updating customer:', err)
      errorMsg.value = err.message || 'Failed to update customer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Customer (DELETE)
  const deleteCustomer = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/customers/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete customer: ${res.status}`)
      }

      // Adjust page if we deleted the last item on the page
      if (customers.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchCustomers()
      }
    } catch (err: any) {
      console.error('Error deleting customer:', err)
      errorMsg.value = err.message || 'Failed to delete customer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Watch filters, search, and page changes to automatically load from server (client-only)
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1 // Reset page to 1
      fetchCustomers()
    })

    watch(currentPage, () => {
      fetchCustomers()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchCustomers()
      } else {
        customers.value = []
        totalFilteredCount.value = 0
      }
    })
  }

  return {
    searchQuery,
    currentPage,
    pageSize,
    isLoading,
    errorMsg,
    fetchCustomers,
    fetchCustomerById,
    paginatedCustomers: customers,
    totalFilteredCount,
    addCustomer,
    updateCustomer,
    deleteCustomer
  }
}
