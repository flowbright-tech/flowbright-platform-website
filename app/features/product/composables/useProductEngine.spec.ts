import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useProductEngine } from './useProductEngine'
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

describe('Product Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch products from backend API with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: 'prod-01', name_en: 'Reagent A', name_th: 'น้ำยา เอ', sku: 'SKU-001', is_active: true }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchProducts, paginatedProducts, totalFilteredCount } = useProductEngine()
    await fetchProducts()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/products?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedProducts.value).toHaveLength(1)
    expect(paginatedProducts.value[0].name_en).toBe('Reagent A')
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single product details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'prod-01', name_en: 'Reagent A', name_th: 'น้ำยา เอ', sku: 'SKU-001', is_active: true }
      })
    })

    const { fetchProductById } = useProductEngine()
    const result = await fetchProductById('prod-01')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/products/prod-01'),
      expect.objectContaining({
        method: 'GET'
      })
    )

    expect(result).not.toBeNull()
    expect(result?.name_en).toBe('Reagent A')
  })

  it('should make POST request on addProduct and then refresh list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const newProductData = {
      name_en: 'Reagent B',
      name_th: 'น้ำยา บี',
      sku: 'SKU-002',
      barcode: '1234567890',
      product_type: 'standard',
      selling_price: 100,
      cost: 50,
      stock: 10,
      reserve_stock: 0,
      unit: 'pcs',
      is_active: true
    }

    const { addProduct } = useProductEngine()
    await addProduct(newProductData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/products',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProductData)
      })
    )
  })
})
