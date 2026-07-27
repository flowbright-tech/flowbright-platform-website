import { ref, watch } from 'vue'
import { useState, useRuntimeConfig } from '#imports'
import type { Vendor, VendorFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

export const useVendorEngine = () => {
  const { session } = useAuthEngine()
  const config = useRuntimeConfig()
  const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'
  const { apiFetch } = useApiFetch()

  // State refs
  const vendors = useState<Vendor[]>('srp_vendors_list', () => [])
  const totalFilteredCount = useState<number>('srp_vendors_total', () => 0)
  const isLoading = useState<boolean>('srp_vendors_loading', () => false)
  const errorMsg = useState<string | null>('srp_vendors_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedCategory = ref('all')

  // API Call to fetch vendors (list)
  const fetchVendors = async () => {
    const token = session.value?.token
    if (!token) {
      vendors.value = []
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

      const res = await apiFetch(`/api/v1/vendors?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch vendors: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        vendors.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching vendors:', err)
      errorMsg.value = err.message || 'An error occurred while fetching vendor data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch a single vendor details by ID
  const fetchVendorById = async (id: string): Promise<Vendor | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/vendors/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch vendor: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Vendor not found')
      }
    } catch (err: any) {
      console.error('Error fetching vendor by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching vendor details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add Vendor (POST to /api/v1/vendors)
  const addVendor = async (data: VendorFormData) => {
    isLoading.value = true
    errorMsg.value = null

    const payload: VendorFormData = {
      address_en: data.address_en || '',
      address_th: data.address_th || '',
      contact_name: data.contact_name || '',
      email: data.email || '',
      image_url: data.image_url || '',
      name_en: data.name_en || '',
      name_th: data.name_th || '',
      phone: data.phone || '',
      tax_id: data.tax_id || '',
      type: data.type || 'company'
    }

    try {
      const res = await apiFetch('/api/v1/vendors', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create vendor: ${res.status}`)
      }

      // Reset page to 1 on new addition and reload
      currentPage.value = 1
      await fetchVendors()
    } catch (err: any) {
      console.error('Error adding vendor:', err)
      errorMsg.value = err.message || 'Failed to create vendor'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Vendor (PUT to /api/v1/vendors/:id)
  const updateVendor = async (id: string, data: Partial<VendorFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/vendors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update vendor: ${res.status}`)
      }

      await fetchVendors()
    } catch (err: any) {
      console.error('Error updating vendor:', err)
      errorMsg.value = err.message || 'Failed to update vendor'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Vendor (DELETE to /api/v1/vendors/:id)
  const deleteVendor = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/vendors/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete vendor: ${res.status}`)
      }

      // Adjust page if we deleted the last item on the page
      if (vendors.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchVendors()
      }
    } catch (err: any) {
      console.error('Error deleting vendor:', err)
      errorMsg.value = err.message || 'Failed to delete vendor'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const validateTaxId = (taxId: string): boolean => {
    return !!taxId && taxId.length >= 8
  }

  // Watch filters, search, and page changes to automatically load from server (client-only)
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1 // Reset page to 1
      fetchVendors()
    })

    watch(currentPage, () => {
      fetchVendors()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchVendors()
      } else {
        vendors.value = []
        totalFilteredCount.value = 0
      }
    })
  }

  return {
    searchQuery,
    selectedCategory,
    currentPage,
    pageSize,
    isLoading,
    errorMsg,
    fetchVendors,
    fetchVendorById,
    paginatedVendors: vendors,
    totalFilteredCount,
    addVendor,
    updateVendor,
    deleteVendor,
    validateTaxId
  }
}
