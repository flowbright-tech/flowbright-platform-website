import { ref, watch } from 'vue'
import { useState } from '#imports'
import type { Package, PackageFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

export const usePackageEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const packages = useState<Package[]>('srp_packages_list', () => [])
  const totalFilteredCount = useState<number>('srp_packages_total', () => 0)
  const isLoading = useState<boolean>('srp_packages_loading', () => false)
  const errorMsg = useState<string | null>('srp_packages_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // API Call to fetch packages (list with pagination)
  const fetchPackages = async () => {
    const token = session.value?.token
    if (!token) {
      packages.value = []
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

      const res = await apiFetch(`/api/v1/packages?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch packages: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        packages.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching packages:', err)
      errorMsg.value = err.message || 'An error occurred while fetching package data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch a single package details by ID
  const fetchPackageById = async (id: string): Promise<Package | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/packages/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch package: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Package not found')
      }
    } catch (err: any) {
      console.error('Error fetching package by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching package details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add Package (POST)
  const addPackage = async (data: PackageFormData) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/packages', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create package: ${res.status}`)
      }

      currentPage.value = 1
      await fetchPackages()
    } catch (err: any) {
      console.error('Error adding package:', err)
      errorMsg.value = err.message || 'Failed to create package'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Package (PUT)
  const updatePackage = async (id: string, data: Partial<PackageFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update package: ${res.status}`)
      }

      await fetchPackages()
    } catch (err: any) {
      console.error('Error updating package:', err)
      errorMsg.value = err.message || 'Failed to update package'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Package (DELETE)
  const deletePackage = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/packages/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete package: ${res.status}`)
      }

      if (packages.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchPackages()
      }
    } catch (err: any) {
      console.error('Error deleting package:', err)
      errorMsg.value = err.message || 'Failed to delete package'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Watch filters, search, and page changes to automatically load from server (client-only)
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1
      fetchPackages()
    })

    watch(currentPage, () => {
      fetchPackages()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchPackages()
      } else {
        packages.value = []
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
    fetchPackages,
    fetchPackageById,
    paginatedPackages: packages,
    totalFilteredCount,
    addPackage,
    updatePackage,
    deletePackage
  }
}
