import { ref, watch } from 'vue'
import { useState } from '#imports'
import type { Bom, BomFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

export const useBomEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const boms = useState<Bom[]>('srp_boms_list', () => [])
  const totalFilteredCount = useState<number>('srp_boms_total', () => 0)
  const isLoading = useState<boolean>('srp_boms_loading', () => false)
  const errorMsg = useState<string | null>('srp_boms_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // API Call to fetch BOMs
  const fetchBoms = async () => {
    const token = session.value?.token
    if (!token) {
      boms.value = []
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

      const res = await apiFetch(`/api/v1/boms?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch BOMs: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        boms.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching BOMs:', err)
      errorMsg.value = err.message || 'An error occurred while fetching BOM data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch a single BOM by ID
  const fetchBomById = async (id: string): Promise<Bom | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/boms/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch BOM: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'BOM not found')
      }
    } catch (err: any) {
      console.error('Error fetching BOM by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching BOM details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add BOM (POST)
  const addBom = async (data: BomFormData) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/boms', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create BOM: ${res.status}`)
      }

      currentPage.value = 1
    } catch (err: any) {
      console.error('Error adding BOM:', err)
      errorMsg.value = err.message || 'Failed to create BOM'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update BOM (PUT)
  const updateBom = async (id: string, data: Partial<BomFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/boms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update BOM: ${res.status}`)
      }
    } catch (err: any) {
      console.error('Error updating BOM:', err)
      errorMsg.value = err.message || 'Failed to update BOM'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete BOM (DELETE)
  const deleteBom = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/boms/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete BOM: ${res.status}`)
      }

      if (boms.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchBoms()
      }
    } catch (err: any) {
      console.error('Error deleting BOM:', err)
      errorMsg.value = err.message || 'Failed to delete BOM'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Watch filters
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1
      fetchBoms()
    })

    watch(currentPage, () => {
      fetchBoms()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchBoms()
      } else {
        boms.value = []
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
    fetchBoms,
    fetchBomById,
    paginatedBoms: boms,
    totalFilteredCount,
    addBom,
    updateBom,
    deleteBom
  }
}
