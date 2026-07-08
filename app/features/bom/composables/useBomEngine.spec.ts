import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useBomEngine } from './useBomEngine'
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

describe('BOM Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch BOMs from backend API with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: 'bom-01', bom_name: 'Standard Formula', product_id: 'prod-01', version: 1, items: [] }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchBoms, paginatedBoms, totalFilteredCount } = useBomEngine()
    await fetchBoms()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/boms?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedBoms.value).toHaveLength(1)
    expect(paginatedBoms.value[0].bom_name).toBe('Standard Formula')
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single BOM details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'bom-01', bom_name: 'Standard Formula', product_id: 'prod-01', version: 1, items: [] }
      })
    })

    const { fetchBomById } = useBomEngine()
    const result = await fetchBomById('bom-01')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/boms/bom-01'),
      expect.objectContaining({
        method: 'GET'
      })
    )

    expect(result).not.toBeNull()
    expect(result?.bom_name).toBe('Standard Formula')
  })

  it('should make POST request on addBom and then refresh list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const newBomData = {
      bom_name: 'Formula Beta',
      product_id: 'prod-02',
      version: 2,
      items: [
        {
          name_en: 'Component A',
          name_th: 'ส่วนประกอบ เอ',
          quantity: 5,
          remark: 'Initial component',
          reserve_stock: 0,
          stock: 100,
          unit: 'pcs'
        }
      ]
    }

    const { addBom } = useBomEngine()
    await addBom(newBomData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/boms',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newBomData)
      })
    )
  })
})
