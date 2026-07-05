import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useCustomerEngine } from './useCustomerEngine'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock client global location to avoid navigation errors in test
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true
  })
}

describe('Customer Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-auth-token-123', 'tenant-bkk-01')
  })

  it('should fetch customers from backend API with correct headers and pagination', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: '1', email: 'test1@flowbright.co', code: 'HN1', is_active: true, type: 'normal' }
        ],
        pagination: { total: 1 }
      })
    })

    const { fetchCustomers, paginatedCustomers, totalFilteredCount } = useCustomerEngine()
    await fetchCustomers()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/customers?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )

    expect(paginatedCustomers.value.length).toBe(1)
    expect(totalFilteredCount.value).toBe(1)
  })

  it('should fetch single customer details by ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'cust-id-123', email: 'single@flowbright.co', first_name_en: 'Single' }
      })
    })

    const { fetchCustomerById } = useCustomerEngine()
    const result = await fetchCustomerById('cust-id-123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/customers/cust-id-123'),
      expect.any(Object)
    )
    expect(result).toBeDefined()
    expect(result?.first_name_en).toBe('Single')
  })

  it('should trigger fetch with search query parameter when search is specified', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        pagination: { total: 0 }
      })
    })

    const { searchQuery, fetchCustomers } = useCustomerEngine()
    searchQuery.value = 'Somchai'
    await fetchCustomers()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('search=Somchai'),
      expect.any(Object)
    )
  })

  it('should make POST request on addCustomer and then refresh list', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().endsWith('/customers')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { id: 'new-id' } })
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [], pagination: { total: 0 } })
      }
    })

    const { addCustomer } = useCustomerEngine()
    const newCustomerData = {
      prefix_en: 'Mr.',
      prefix_th: 'นาย',
      first_name_en: 'Test',
      last_name_en: 'User',
      first_name_th: 'ทดสอบ',
      last_name_th: 'ผู้ใช้',
      email: 'test@flowbright.co',
      phone: '0812345678',
      address_en: '123 Test Rd',
      address_th: '123 ถนนทดสอบ',
      gender: 'Male',
      tax_id: '1234567890123',
      type: 'normal',
      is_active: true,
      nationality: 'Thai',
      birth_date: '1990-01-01',
      id_card: '12345',
      passport: 'P123',
      occupation: 'Developer',
      social_media: '',
      image_url: ''
    }

    await addCustomer(newCustomerData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/customers',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(newCustomerData)
      })
    )
  })

  it('should make PUT request on updateCustomer', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().includes('/customers/cust-id-123')) {
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

    const { updateCustomer } = useCustomerEngine()
    const updateData = { first_name_en: 'UpdatedName' }

    await updateCustomer('cust-id-123', updateData)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/customers/cust-id-123',
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

  it('should make DELETE request on deleteCustomer', async () => {
    mockFetch.mockImplementation(async (url) => {
      if (url.toString().includes('/customers/cust-id-delete')) {
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

    const { deleteCustomer } = useCustomerEngine()
    await deleteCustomer('cust-id-delete')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://flowbright-platform-api.onrender.com/api/v1/customers/cust-id-delete',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123'
        })
      })
    )
  })

  it('should trigger logout flow automatically when API responds with 401 Unauthorized', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    })

    const { fetchCustomers, errorMsg } = useCustomerEngine()
    const { isAuthenticated } = useAuthEngine()
    
    await fetchCustomers()

    // Assert authentication was cleared
    expect(isAuthenticated.value).toBe(false)
    expect(errorMsg.value).toContain('Session expired')
  })
})
