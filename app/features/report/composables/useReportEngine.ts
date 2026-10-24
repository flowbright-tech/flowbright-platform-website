import { ref } from 'vue'
import { useToast, useI18n } from '#imports'
import { useApiFetch } from '../../../composables/useApiFetch'
import type { ReportPreset, DateRangeFilter } from '../types'

/**
 * Converts a Date object to YYYY-MM-DD using local time components.
 */
export const toISODateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calculates start and end dates based on a specified preset.
 */
export const getDatePresetRange = (preset: ReportPreset, now = new Date()): DateRangeFilter => {
  const today = new Date(now)
  let start = new Date(now)
  let end = new Date(now)

  if (preset === 'today') {
    start = today
    end = today
  } else if (preset === 'this_month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  } else if (preset === 'last_month') {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    end = new Date(today.getFullYear(), today.getMonth(), 0)
  } else if (preset === 'last_7_days') {
    start = new Date(today)
    start.setDate(today.getDate() - 6)
    end = today
  } else if (preset === 'last_30_days') {
    start = new Date(today)
    start.setDate(today.getDate() - 29)
    end = today
  }

  return {
    startDate: toISODateString(start),
    endDate: toISODateString(end)
  }
}

/**
 * Extracts filename from the Content-Disposition header if available.
 */
export const extractFilenameFromHeader = (disposition: string | null, fallback: string): string => {
  if (!disposition) return fallback
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '').trim()
  }
  return fallback
}

/**
 * Triggers a client-side file download for a Blob object.
 */
export const triggerFileDownload = (blob: Blob, filename: string): void => {
  if (typeof window === 'undefined' || !window.URL) return
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export const useReportEngine = () => {
  const { apiFetch } = useApiFetch()
  const toast = useToast()
  const { t } = useI18n()

  const isDownloadingStock = ref(false)
  const isDownloadingSales = ref(false)

  // Default to the current month range (e.g. 2026-10-01 to 2026-10-31)
  const defaultRange = getDatePresetRange('this_month')
  const startDate = ref(defaultRange.startDate)
  const endDate = ref(defaultRange.endDate)
  const activePreset = ref<ReportPreset | null>('this_month')
  const errorMsg = ref<string | null>(null)

  const applyPreset = (preset: ReportPreset) => {
    activePreset.value = preset
    const range = getDatePresetRange(preset)
    startDate.value = range.startDate
    endDate.value = range.endDate
  }

  /**
   * Downloads the current stock balance report as an Excel spreadsheet (.xlsx).
   * Calls: GET /api/v1/products/export/stock-report
   * Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   */
  const downloadStockReport = async (): Promise<boolean> => {
    isDownloadingStock.value = true
    errorMsg.value = null

    try {
      const res = await apiFetch('/api/v1/products/export/stock-report', {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to export stock report with status: ${res.status}`)
      }

      const blob = await res.blob()
      const fallbackName = `product_stock_report_${toISODateString(new Date())}.xlsx`
      const filename = extractFilenameFromHeader(res.headers.get('content-disposition'), fallbackName)

      triggerFileDownload(blob, filename)

      toast.add({
        title: t('reports.export_success') || 'Report exported successfully',
        description: filename,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })

      return true
    } catch (err: any) {
      console.error('Error exporting stock report:', err)
      const message = err.message || t('reports.export_failed') || 'Failed to export stock report'
      errorMsg.value = message
      toast.add({
        title: t('reports.export_failed') || 'Failed to export report',
        description: message,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return false
    } finally {
      isDownloadingStock.value = false
    }
  }

  /**
   * Downloads the sales and orders report for a date range as an Excel spreadsheet (.xlsx).
   * Calls: /api/v1/orders/export/sales-report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
   * Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   */
  const downloadSalesReport = async (customStart?: string, customEnd?: string): Promise<boolean> => {
    const sDate = (customStart ?? startDate.value)?.trim()
    const eDate = (customEnd ?? endDate.value)?.trim()

    if (!sDate || !eDate) {
      const msg = t('reports.date_required') || 'Please select both start date and end date'
      toast.add({
        title: t('reports.export_failed') || 'Validation Error',
        description: msg,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return false
    }

    if (sDate > eDate) {
      const msg = t('reports.invalid_date_range') || 'Start date cannot be after end date'
      toast.add({
        title: t('reports.export_failed') || 'Validation Error',
        description: msg,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return false
    }

    isDownloadingSales.value = true
    errorMsg.value = null

    try {
      const searchParams = new URLSearchParams()
      searchParams.set('start_date', sDate)
      searchParams.set('end_date', eDate)
      const path = `/api/v1/orders/export/sales-report?${searchParams.toString()}`

      const headers = {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      // Backend route uses POST (or GET). We try POST first as required by API router, with fallback to GET if 405.
      let res = await apiFetch(path, {
        method: 'POST',
        headers
      }).catch(async (err: any) => {
        // Fallback retry with GET if network or client error
        return await apiFetch(path, { method: 'GET', headers })
      })

      if (res.status === 405) {
        res = await apiFetch(path, {
          method: 'GET',
          headers
        })
      }

      if (!res.ok) {
        throw new Error(`Failed to export sales report with status: ${res.status}`)
      }

      const blob = await res.blob()
      const fallbackName = `sales_report_${sDate}_${eDate}.xlsx`
      const filename = extractFilenameFromHeader(res.headers.get('content-disposition'), fallbackName)

      triggerFileDownload(blob, filename)

      toast.add({
        title: t('reports.export_success') || 'Report exported successfully',
        description: filename,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })

      return true
    } catch (err: any) {
      console.error('Error exporting sales report:', err)
      const message = err.message || t('reports.export_failed') || 'Failed to export sales report'
      errorMsg.value = message
      toast.add({
        title: t('reports.export_failed') || 'Failed to export report',
        description: message,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return false
    } finally {
      isDownloadingSales.value = false
    }
  }

  return {
    isDownloadingStock,
    isDownloadingSales,
    startDate,
    endDate,
    activePreset,
    errorMsg,
    applyPreset,
    downloadStockReport,
    downloadSalesReport
  }
}
