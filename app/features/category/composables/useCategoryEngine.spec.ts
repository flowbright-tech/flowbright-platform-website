import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useCategoryEngine } from './useCategoryEngine'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

vi.mock('#imports', async (importOriginal) => {
  const actual = await importOriginal() as any
  const activeRefs = new Map()
  return {
    ...actual,
    useState: (key: string, init: () => any) => {
      if (!activeRefs.has(key)) {
        activeRefs.set(key, ref(init()))
      }
      return activeRefs.get(key)
    },
    useRuntimeConfig: () => ({
      public: {
        apiDomain: 'https://flowbright-platform-api.onrender.com'
      }
    }),
    useToast: () => ({
      add: vi.fn()
    }),
    useI18n: () => ({
      t: (key: string) => key,
      te: () => false
    })
  }
})

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true
  })
}

describe('Category Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch categories from backend API with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: 'cat-01', name_en: 'Raw Materials', name_th: 'วัตถุดิบ', level: 1, is_active: true, sort_order: 0 }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchCategories, paginatedCategories, totalFilteredCount } = useCategoryEngine()
    await fetchCategories()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/categories?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedCategories.value).toHaveLength(1)
    expect(paginatedCategories.value[0].name_en).toBe('Raw Materials')
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single category details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'cat-01', name_en: 'Raw Materials', name_th: 'วัตถุดิบ', level: 1, is_active: true, sort_order: 0 }
      })
    })

    const { fetchCategoryById } = useCategoryEngine()
    const result = await fetchCategoryById('cat-01')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/categories/cat-01'),
      expect.objectContaining({
        method: 'GET'
      })
    )

    expect(result).not.toBeNull()
    expect(result?.name_en).toBe('Raw Materials')
  })

  it('should make POST request on addCategory and then refresh list', async () => {
    // 1st call for POST, 2nd & 3rd for refresh fetches
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const newCategoryData = {
      name_en: 'Packaging',
      name_th: 'บรรจุภัณฑ์',
      parent_id: '',
      level: 0,
      is_active: true,
      sort_order: 1,
      image_url: ''
    }

    const { addCategory } = useCategoryEngine()
    await addCategory(newCategoryData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/categories',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newCategoryData)
      })
    )
  })

  it('should make PUT request on updateCategory', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const updateData = {
      name_en: 'Packaging Updated'
    }

    const { updateCategory } = useCategoryEngine()
    await updateCategory('cat-01', updateData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/categories/cat-01',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    )
  })

  it('should make DELETE request on deleteCategory', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const { deleteCategory } = useCategoryEngine()
    await deleteCategory('cat-01')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/categories/cat-01',
      expect.objectContaining({
        method: 'DELETE'
      })
    )
  })
})
