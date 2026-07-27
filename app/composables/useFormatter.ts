/**
 * Reusable formatting utilities for dates, times, and currency numbers across Flow Bright SRP.
 */
export const useFormatter = () => {
  /**
   * Formats a date string or Date object into `dd-mmm-yy hh:mm`
   * Example: "2026-07-27T12:24:45" -> "27-Jul-26 12:24"
   */
  const formatDateTime = (dateStr?: string | Date | null): string => {
    if (!dateStr) return '-'
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
      if (isNaN(date.getTime())) return '-'

      const day = String(date.getDate()).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const year = String(date.getFullYear()).slice(-2)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${day}-${month}-${year} ${hours}:${minutes}`
    } catch (e) {
      return '-'
    }
  }

  /**
   * Formats a date string or Date object into `dd-mmm-yy`
   * Example: "2026-07-27" -> "27-Jul-26"
   */
  const formatDate = (dateStr?: string | Date | null): string => {
    if (!dateStr) return '-'
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
      if (isNaN(date.getTime())) return '-'

      const day = String(date.getDate()).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const year = String(date.getFullYear()).slice(-2)

      return `${day}-${month}-${year}`
    } catch (e) {
      return '-'
    }
  }

  return {
    formatDateTime,
    formatDate
  }
}
