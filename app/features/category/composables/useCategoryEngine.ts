import { ref, watch } from 'vue'
import { useState, useRuntimeConfig } from '#imports'
import type { Category, CategoryFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

export const useCategoryEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const categories = useState<Category[]>('srp_categories_list', () => [])
  const allCategories = useState<Category[]>('srp_categories_all', () => [])
  const totalFilteredCount = useState<number>('srp_categories_total', () => 0)
  const isLoading = useState<boolean>('srp_categories_loading', () => false)
  const errorMsg = useState<string | null>('srp_categories_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // API Call to fetch categories (list with pagination)
  const fetchCategories = async () => {
    const token = session.value?.token
    if (!token) {
      categories.value = []
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

      const res = await apiFetch(`/api/v1/categories?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        categories.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      errorMsg.value = err.message || 'An error occurred while fetching category data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch all categories flatly (no page bounds, for parent selection)
  const fetchAllCategories = async () => {
    const token = session.value?.token
    if (!token) {
      allCategories.value = []
      return
    }

    try {
      const res = await apiFetch('/api/v1/categories?parent_id=null')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          allCategories.value = json.data
        }
      }
    } catch (err) {
      console.error('Error fetching all categories:', err)
    }
  }

  // API Call to fetch a single category details by ID
  const fetchCategoryById = async (id: string): Promise<Category | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/categories/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch category: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Category not found')
      }
    } catch (err: any) {
      console.error('Error fetching category by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching category details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add Category (POST)
  const addCategory = async (data: CategoryFormData) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create category: ${res.status}`)
      }

      currentPage.value = 1
      await fetchCategories()
      await fetchAllCategories()
    } catch (err: any) {
      console.error('Error adding category:', err)
      errorMsg.value = err.message || 'Failed to create category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Category (PUT)
  const updateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update category: ${res.status}`)
      }

      await fetchCategories()
      await fetchAllCategories()
    } catch (err: any) {
      console.error('Error updating category:', err)
      errorMsg.value = err.message || 'Failed to update category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Category (DELETE)
  const deleteCategory = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/categories/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete category: ${res.status}`)
      }

      if (categories.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchCategories()
      }
      await fetchAllCategories()
    } catch (err: any) {
      console.error('Error deleting category:', err)
      errorMsg.value = err.message || 'Failed to delete category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Watch filters, search, and page changes to automatically load from server (client-only)
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1
      fetchCategories()
    })

    watch(currentPage, () => {
      fetchCategories()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchCategories()
        fetchAllCategories()
      } else {
        categories.value = []
        allCategories.value = []
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
    fetchCategories,
    fetchAllCategories,
    fetchCategoryById,
    paginatedCategories: categories,
    allCategories,
    totalFilteredCount,
    addCategory,
    updateCategory,
    deleteCategory
  }
}
