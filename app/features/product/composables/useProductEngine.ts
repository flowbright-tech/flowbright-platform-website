import { ref, watch } from 'vue'
import { useState } from '#imports'
import type { Product, ProductFormData } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useDebounce } from '../../../composables/useDebounce'
import { useApiFetch } from '../../../composables/useApiFetch'

export const useProductEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const products = useState<Product[]>('srp_products_list', () => [])
  const totalFilteredCount = useState<number>('srp_products_total', () => 0)
  const isLoading = useState<boolean>('srp_products_loading', () => false)
  const errorMsg = useState<string | null>('srp_products_error', () => null)

  const searchQuery = ref('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // API Call to fetch products (list with pagination)
  const fetchProducts = async () => {
    const token = session.value?.token
    if (!token) {
      products.value = []
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

      const res = await apiFetch(`/api/v1/products?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        products.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      errorMsg.value = err.message || 'An error occurred while fetching product data'
    } finally {
      isLoading.value = false
    }
  }

  // API Call to fetch a single product details by ID
  const fetchProductById = async (id: string): Promise<Product | null> => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/products/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`)
      }

      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      } else {
        throw new Error(json.message || 'Product not found')
      }
    } catch (err: any) {
      console.error('Error fetching product by ID:', err)
      errorMsg.value = err.message || 'An error occurred while fetching product details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Add Product (POST)
  const addProduct = async (data: ProductFormData) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to create product: ${res.status}`)
      }

      currentPage.value = 1
      await fetchProducts()
    } catch (err: any) {
      console.error('Error adding product:', err)
      errorMsg.value = err.message || 'Failed to create product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update Product (PUT)
  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to update product: ${res.status}`)
      }

      await fetchProducts()
    } catch (err: any) {
      console.error('Error updating product:', err)
      errorMsg.value = err.message || 'Failed to update product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete Product (DELETE)
  const deleteProduct = async (id: string) => {
    isLoading.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch(`/api/v1/products/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Failed to delete product: ${res.status}`)
      }

      if (products.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      } else {
        await fetchProducts()
      }
    } catch (err: any) {
      console.error('Error deleting product:', err)
      errorMsg.value = err.message || 'Failed to delete product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Watch filters, search, and page changes to automatically load from server (client-only)
  if (import.meta.client) {
    watch(debouncedSearchQuery, () => {
      currentPage.value = 1
      fetchProducts()
    })

    watch(currentPage, () => {
      fetchProducts()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchProducts()
      } else {
        products.value = []
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
    fetchProducts,
    fetchProductById,
    paginatedProducts: products,
    totalFilteredCount,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
