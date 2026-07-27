import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useVendorEngine } from './useVendorEngine'
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

describe('Vendor Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch vendors from backend API /api/v1/vendors with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: 'vnd-1', name_en: 'Siam Supplier', name_th: 'สยามซัพพลาย', tax_id: '0105560012345', phone: '021234567', type: 'company' }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchVendors, paginatedVendors, totalFilteredCount } = useVendorEngine()
    await fetchVendors()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/vendors?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedVendors.value.length).toBe(1)
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single vendor details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'vnd-123', name_en: 'Single Vendor', contact_name: 'John Doe' }
      })
    })

    const { fetchVendorById } = useVendorEngine()
    const result = await fetchVendorById('vnd-123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/vendors/vnd-123'),
      expect.any(Object)
    )
    expect(result).toBeDefined()
    expect(result?.name_en).toBe('Single Vendor')
  })

  it('should make POST request on addVendor conforming to payload schema', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().endsWith('/vendors')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { id: 'new-vnd-id' } })
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [], pagination: { total: 0 } })
      }
    })

    const { addVendor } = useVendorEngine()
    const newVendorData = {
      name_en: 'Global Polymer Co.',
      name_th: 'โกลบอล พอลิเมอร์',
      contact_name: 'Somchai Prasert',
      phone: '+66812345678',
      email: 'vendor@polymer.co',
      address_en: '123 Industrial Estate',
      address_th: '123 นิคมอุตสาหกรรม',
      tax_id: '0105560099887',
      type: 'company',
      image_url: 'https://example.com/logo.png'
    }

    await addVendor(newVendorData)

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://flowbright-platform-api.onrender.com/api/v1/vendors',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123',
          'Content-Type': 'application/json'
        })
      })
    )

    const postCallArg = mockFetch.mock.calls[0][1]
    expect(JSON.parse(postCallArg.body)).toEqual(newVendorData)
  })

  it('should make PUT request on updateVendor', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().includes('/vendors/vnd-123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: {} })
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [], pagination: { total: 0 } })
      }
    })

    const { updateVendor } = useVendorEngine()
    const updateData = { name_en: 'Updated Vendor Name' }

    await updateVendor('vnd-123', updateData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/vendors/vnd-123',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(updateData)
      })
    )
  })

  it('should make DELETE request on deleteVendor', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().includes('/vendors/vnd-delete')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [], pagination: { total: 0 } })
      }
    })

    const { deleteVendor } = useVendorEngine()
    await deleteVendor('vnd-delete')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/vendors/vnd-delete',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )
  })
})
