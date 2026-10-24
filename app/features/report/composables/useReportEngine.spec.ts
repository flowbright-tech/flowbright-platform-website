import { ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import {
  useReportEngine,
  toISODateString,
  getDatePresetRange,
  extractFilenameFromHeader
} from './useReportEngine'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

const mockToastAdd = vi.fn()
const mockT = vi.fn((key: string) => key)

vi.mock('#imports', async (importOriginal) => {
  const actual = (await importOriginal()) as any
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
      add: mockToastAdd
    }),
    useI18n: () => ({
      t: mockT,
      te: () => false
    })
  }
})

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  window.URL.revokeObjectURL = vi.fn()
}

describe('Report Engine Domain Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { login } = useAuthEngine()
    login('admin@flowbright.co', 'mock-admin-token-123', 'tenant-01')
  })

  describe('Pure Utilities', () => {
    it('should format date to ISO YYYY-MM-DD correctly', () => {
      const d = new Date(2026, 9, 24) // Month is 0-indexed (9 = Oct)
      expect(toISODateString(d)).toBe('2026-10-24')
    })

    it('should calculate preset date ranges accurately', () => {
      const fixedNow = new Date(2026, 9, 24) // 2026-10-24

      const todayRange = getDatePresetRange('today', fixedNow)
      expect(todayRange.startDate).toBe('2026-10-24')
      expect(todayRange.endDate).toBe('2026-10-24')

      const thisMonthRange = getDatePresetRange('this_month', fixedNow)
      expect(thisMonthRange.startDate).toBe('2026-10-01')
      expect(thisMonthRange.endDate).toBe('2026-10-31')

      const lastMonthRange = getDatePresetRange('last_month', fixedNow)
      expect(lastMonthRange.startDate).toBe('2026-09-01')
      expect(lastMonthRange.endDate).toBe('2026-09-30')

      const last7Days = getDatePresetRange('last_7_days', fixedNow)
      expect(last7Days.startDate).toBe('2026-10-18')
      expect(last7Days.endDate).toBe('2026-10-24')

      const last30Days = getDatePresetRange('last_30_days', fixedNow)
      expect(last30Days.startDate).toBe('2026-09-25')
      expect(last30Days.endDate).toBe('2026-10-24')
    })

    it('should extract filename from Content-Disposition header with quotes or unquoted', () => {
      expect(
        extractFilenameFromHeader('attachment; filename="product_stock_report_2026-10-24.xlsx"', 'default.xlsx')
      ).toBe('product_stock_report_2026-10-24.xlsx')

      expect(
        extractFilenameFromHeader('attachment; filename=sales_report.xlsx', 'default.xlsx')
      ).toBe('sales_report.xlsx')

      expect(extractFilenameFromHeader(null, 'default.xlsx')).toBe('default.xlsx')
      expect(extractFilenameFromHeader('inline', 'default.xlsx')).toBe('default.xlsx')
    })
  })

  describe('Stock Report Export', () => {
    it('should call GET /api/v1/products/export/stock-report with spreadsheet Accept header and download blob', async () => {
      const mockBlob = new Blob(['mock-binary-stock-data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="custom_stock_report.xlsx"'
        }),
        blob: async () => mockBlob
      })

      const { downloadStockReport, isDownloadingStock } = useReportEngine()
      const promise = downloadStockReport()
      expect(isDownloadingStock.value).toBe(true)

      const result = await promise
      expect(result).toBe(true)
      expect(isDownloadingStock.value).toBe(false)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://flowbright-platform-api.onrender.com/api/v1/products/export/stock-report',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Authorization': 'Bearer mock-admin-token-123'
          })
        })
      )

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'success',
          description: 'custom_stock_report.xlsx'
        })
      )
    })

    it('should handle stock export failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        clone: () => ({
          json: async () => ({ message: 'Database connection failed' })
        })
      })

      const { downloadStockReport, errorMsg } = useReportEngine()
      const result = await downloadStockReport()

      expect(result).toBe(false)
      expect(errorMsg.value).toBeTruthy()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'error'
        })
      )
    })
  })

  describe('Sales Report Export', () => {
    it('should reject when date range is missing or start_date is after end_date', async () => {
      const { downloadSalesReport } = useReportEngine()

      // Missing start date
      const r1 = await downloadSalesReport('', '2026-10-31')
      expect(r1).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()

      // Invalid range (start after end)
      const r2 = await downloadSalesReport('2026-11-01', '2026-10-31')
      expect(r2).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should call sales-report API with start_date and end_date query params and download blob', async () => {
      const mockBlob = new Blob(['mock-binary-sales-data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="sales_report_2026-10-01_2026-10-31.xlsx"'
        }),
        blob: async () => mockBlob
      })

      const { downloadSalesReport, isDownloadingSales } = useReportEngine()
      const promise = downloadSalesReport('2026-10-01', '2026-10-31')
      expect(isDownloadingSales.value).toBe(true)

      const result = await promise
      expect(result).toBe(true)
      expect(isDownloadingSales.value).toBe(false)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://flowbright-platform-api.onrender.com/api/v1/orders/export/sales-report?start_date=2026-10-01&end_date=2026-10-31',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Authorization': 'Bearer mock-admin-token-123'
          })
        })
      )

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'success',
          description: 'sales_report_2026-10-01_2026-10-31.xlsx'
        })
      )
    })

    it('should fallback to GET if POST returns 405 Method Not Allowed', async () => {
      const mockBlob = new Blob(['sales-data'])

      // First call (POST) returns 405
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        statusText: 'Method Not Allowed',
        clone: () => ({
          json: async () => ({ message: 'Method Not Allowed' })
        })
      })

      // Second call (GET retry) returns 200
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Disposition': 'attachment; filename="fallback_sales.xlsx"'
        }),
        blob: async () => mockBlob
      })

      const { downloadSalesReport } = useReportEngine()
      const result = await downloadSalesReport('2026-10-01', '2026-10-31')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch.mock.calls[0][1].method).toBe('POST')
      expect(mockFetch.mock.calls[1][1].method).toBe('GET')
    })
  })

  describe('Presets Management', () => {
    it('should update startDate and endDate when preset is selected', () => {
      const { startDate, endDate, activePreset, applyPreset } = useReportEngine()

      applyPreset('last_7_days')
      expect(activePreset.value).toBe('last_7_days')
      expect(startDate.value).toBeTruthy()
      expect(endDate.value).toBeTruthy()
      expect(new Date(startDate.value).getTime()).toBeLessThanOrEqual(new Date(endDate.value).getTime())
    })
  })
})
