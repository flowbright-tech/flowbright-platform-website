import { describe, it, expect } from 'vitest'
import { useFormatter } from './useFormatter'

describe('useFormatter Utility', () => {
  const { formatDateTime, formatDate } = useFormatter()

  it('should format ISO date-time string into dd-mmm-yy hh:mm format', () => {
    const isoString = '2026-07-27T12:24:45.000Z'
    const result = formatDateTime(isoString)
    // Note: Local time formatting depends on timezone, but format structure should match dd-mmm-yy hh:mm regex
    expect(result).toMatch(/^\d{2}-[A-Z][a-z]{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('should return "-" for empty or invalid date strings', () => {
    expect(formatDateTime('')).toBe('-')
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime('invalid-date')).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
    expect(formatDate('invalid-date')).toBe('-')
  })

  it('should format date string into dd-mmm-yy format', () => {
    const result = formatDate('2026-01-05T00:00:00.000Z')
    expect(result).toMatch(/^\d{2}-[A-Z][a-z]{2}-\d{2}$/)
  })
})
