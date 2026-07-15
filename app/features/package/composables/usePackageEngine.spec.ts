import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { usePackageEngine } from './usePackageEngine'
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

describe('Package Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch packages from backend API with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'pkg-01',
            company_id: 'tenant-bkk-01',
            name_en: 'Combo Gift',
            name_th: 'ชุดของขวัญคอมโบ',
            price: 500,
            items: [{ product_id: 'prod-01', quantity: 2 }]
          }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchPackages, paginatedPackages, totalFilteredCount } = usePackageEngine()
    await fetchPackages()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/packages?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedPackages.value).toHaveLength(1)
    expect(paginatedPackages.value[0].name_en).toBe('Combo Gift')
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single package details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'pkg-01',
          company_id: 'tenant-bkk-01',
          name_en: 'Combo Gift',
          name_th: 'ชุดของขวัญคอมโบ',
          price: 500,
          items: [{ product_id: 'prod-01', quantity: 2 }]
        }
      })
    })

    const { fetchPackageById } = usePackageEngine()
    const result = await fetchPackageById('pkg-01')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/packages/pkg-01'),
      expect.objectContaining({
        method: 'GET'
      })
    )

    expect(result).not.toBeNull()
    expect(result?.name_en).toBe('Combo Gift')
  })

  it('should make POST request on addPackage and then refresh list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const newPackageData = {
      name_en: 'New Bundle',
      name_th: 'ชุดสินค้าใหม่',
      description: 'Test description',
      image_url: 'https://example.com/image.png',
      price: 150,
      items: [{ product_id: 'prod-02', quantity: 3 }]
    }

    const { addPackage } = usePackageEngine()
    await addPackage(newPackageData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/packages',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newPackageData)
      })
    )
  })

  it('should make PUT request on updatePackage', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const updateData = {
      name_en: 'Combo Gift Updated'
    }

    const { updatePackage } = usePackageEngine()
    await updatePackage('pkg-01', updateData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/packages/pkg-01',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    )
  })

  it('should make DELETE request on deletePackage', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: []
      })
    })

    const { deletePackage } = usePackageEngine()
    await deletePackage('pkg-01')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/packages/pkg-01',
      expect.objectContaining({
        method: 'DELETE'
      })
    )
  })
})
