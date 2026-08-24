import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import {
  useAuditLogEngine,
  getActionColor,
  getActionBadgeClass,
  getActionIcon,
  getEntityTypeIcon,
  formatAuditDateTime,
  getAuditUserDisplayName
} from './useAuditLogEngine'
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

describe('Audit Log Engine API & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-admin-token-123', 'tenant-bkk-01')
  })

  it('should fetch audit logs from backend API with correct headers and pagination', async () => {
    const mockData = [
      {
        id: '57d5f56c-934c-4e8e-8139-96acd328a159',
        company_id: 'comp-1',
        user_id: 'user-1',
        action: 'CREATE',
        entity_type: 'order',
        entity_id: 'order-123',
        details: { order_number: 'OR202600000016', total_amount: 200 },
        created_at: '2026-08-21T14:39:44.791209+00:00',
        user: {
          id: 'user-1',
          first_name_th: 'ชาญชัย',
          last_name_th: 'เจียมวิจักษณ์',
          first_name_en: 'Chanchai',
          last_name_en: 'Jeimvijack',
          role: 'admin',
          email: 'fixxyzeally@gmail.com'
        }
      }
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        statusCode: 200,
        data: mockData,
        pagination: {
          hasMore: false,
          page: 1,
          limit: 10,
          total: 1
        }
      })
    })

    const { fetchAuditLogs, auditLogs, totalFilteredCount, isLoading } = useAuditLogEngine()
    await fetchAuditLogs()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://flowbright-platform-api.onrender.com/api/v1/audit-logs?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-admin-token-123'
        })
      })
    )

    expect(auditLogs.value.length).toBe(1)
    expect(auditLogs.value[0].action).toBe('CREATE')
    expect(totalFilteredCount.value).toBe(1)
    expect(isLoading.value).toBe(false)
  })

  it('should pass search, action, entity_type, user_id, start_date, and end_date query parameters to API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false }
      })
    })

    const {
      fetchAuditLogs,
      searchQuery,
      selectedAction,
      selectedEntityType,
      selectedUserId,
      startDate,
      endDate
    } = useAuditLogEngine()

    searchQuery.value = 'OR2026'
    selectedAction.value = 'UPDATE'
    selectedEntityType.value = 'product'
    selectedUserId.value = 'user-999'
    startDate.value = '2026-08-01T00:00:00.000Z'
    endDate.value = '2026-08-15T23:59:59.999Z'

    await fetchAuditLogs()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('search=OR2026'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('action=UPDATE'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('entity_type=product'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('user_id=user-999'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('start_date=2026-08-01T00%3A00%3A00.000Z'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('end_date=2026-08-15T23%3A59%3A59.999Z'),
      expect.any(Object)
    )
  })

  it('should reset all filters including searchQuery and reload page 1 when resetFilters is called', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false }
      })
    })

    const {
      resetFilters,
      searchQuery,
      selectedAction,
      selectedEntityType,
      selectedUserId,
      startDate,
      endDate,
      currentPage
    } = useAuditLogEngine()

    searchQuery.value = 'Test'
    selectedAction.value = 'DELETE'
    selectedEntityType.value = 'order'
    selectedUserId.value = 'user-1'
    startDate.value = '2026-08-01'
    endDate.value = '2026-08-31'
    currentPage.value = 3

    resetFilters()

    expect(searchQuery.value).toBe('')
    expect(selectedAction.value).toBe('')
    expect(selectedEntityType.value).toBe('')
    expect(selectedUserId.value).toBe('')
    expect(startDate.value).toBe('')
    expect(endDate.value).toBe('')
    expect(currentPage.value).toBe(1)
  })

  it('should trigger logout when API returns 401 Unauthorized', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    })

    const { fetchAuditLogs, errorMsg } = useAuditLogEngine()
    const { isAuthenticated } = useAuthEngine()

    await fetchAuditLogs()

    expect(isAuthenticated.value).toBe(false)
    expect(errorMsg.value).toContain('Session expired')
  })

  describe('Helper Utilities', () => {
    it('should return correct action badge colors and classes matching order status', () => {
      expect(getActionColor('CREATE')).toBe('success')
      expect(getActionColor('UPDATE')).toBe('warning')
      expect(getActionColor('DELETE')).toBe('error')
      expect(getActionColor('OTHER')).toBe('primary')

      expect(getActionBadgeClass('CREATE')).toContain('emerald')
      expect(getActionBadgeClass('UPDATE')).toContain('amber')
      expect(getActionBadgeClass('DELETE')).toContain('rose')
      expect(getActionBadgeClass('OTHER')).toContain('slate')
    })

    it('should return correct action icons', () => {
      expect(getActionIcon('CREATE')).toBe('i-heroicons-plus-circle')
      expect(getActionIcon('UPDATE')).toBe('i-heroicons-pencil-square')
      expect(getActionIcon('DELETE')).toBe('i-heroicons-trash')
      expect(getActionIcon('UNKNOWN')).toBe('i-heroicons-document-text')
    })

    it('should return correct entity icons', () => {
      expect(getEntityTypeIcon('order')).toBe('i-heroicons-clipboard-document-check')
      expect(getEntityTypeIcon('product')).toBe('i-heroicons-shopping-bag')
      expect(getEntityTypeIcon('customer')).toBe('i-heroicons-user-group')
      expect(getEntityTypeIcon('vendor')).toBe('i-heroicons-building-storefront')
      expect(getEntityTypeIcon('product_package')).toBe('i-heroicons-gift')
      expect(getEntityTypeIcon('bom')).toBe('i-heroicons-cog-8-tooth')
      expect(getEntityTypeIcon('category')).toBe('i-heroicons-tag')
      expect(getEntityTypeIcon('user')).toBe('i-heroicons-user')
      expect(getEntityTypeIcon('company')).toBe('i-heroicons-building-office')
    })

    it('should format audit datetime properly', () => {
      const formatted = formatAuditDateTime('2026-08-21T14:39:44.791209+00:00')
      expect(formatted).toBeDefined()
      expect(formatted).not.toBe('-')
      expect(formatAuditDateTime('')).toBe('-')
      expect(formatAuditDateTime(null)).toBe('-')
    })

    it('should format user display name correctly in TH and EN', () => {
      const user = {
        id: 'u1',
        first_name_th: 'ชาญชัย',
        last_name_th: 'เจียมวิจักษณ์',
        first_name_en: 'Chanchai',
        last_name_en: 'Jeimvijack',
        email: 'test@flowbright.co'
      }

      expect(getAuditUserDisplayName(user, 'th')).toBe('ชาญชัย เจียมวิจักษณ์')
      expect(getAuditUserDisplayName(user, 'en')).toBe('Chanchai Jeimvijack')
      expect(getAuditUserDisplayName(null)).toBe('System / Unknown')
      expect(getAuditUserDisplayName({ id: 'u2', email: 'only@email.com' }, 'th')).toBe('only@email.com')
    })
  })
})
