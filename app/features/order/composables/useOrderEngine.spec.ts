import { describe, it, expect } from 'vitest'
import { calculateItemSubtotal, calculateOrderTotal, getTodayDateString, formatDeliveryDate } from './useOrderEngine'

describe('Order Calculation & Utility Engine', () => {
  describe('calculateItemSubtotal', () => {
    it('should accurately calculate item subtotal given quantity and unit price', () => {
      expect(calculateItemSubtotal(2, 150)).toBe(300)
      expect(calculateItemSubtotal(3, 49.99)).toBe(149.97)
    })

    it('should safely return 0 when quantity or unit price are 0 or negative', () => {
      expect(calculateItemSubtotal(0, 500)).toBe(0)
      expect(calculateItemSubtotal(5, 0)).toBe(0)
      expect(calculateItemSubtotal(-1, 100)).toBe(0)
      expect(calculateItemSubtotal(5, -20)).toBe(0)
    })

    it('should handle floating point rounding correctly to 2 decimal places', () => {
      expect(calculateItemSubtotal(3, 10.333333)).toBe(31.00)
    })
  })

  describe('calculateOrderTotal', () => {
    it('should accurately sum subtotals of all order items', () => {
      const items = [
        { quantity: 2, unit_price: 100, subtotal: 200 },
        { quantity: 1, unit_price: 350.50, subtotal: 350.50 },
        { quantity: 3, unit_price: 10, subtotal: 30 }
      ]
      expect(calculateOrderTotal(items)).toBe(580.50)
    })

    it('should dynamically calculate subtotal if item subtotal is omitted', () => {
      const items = [
        { quantity: 2, unit_price: 100 },
        { quantity: 4, unit_price: 25 }
      ]
      expect(calculateOrderTotal(items)).toBe(300)
    })

    it('should return 0 when items array is empty or invalid', () => {
      expect(calculateOrderTotal([])).toBe(0)
      expect(calculateOrderTotal(null as any)).toBe(0)
    })
  })

  describe('getTodayDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const mockDate = new Date(2026, 6, 19) // July 19, 2026
      expect(getTodayDateString(mockDate)).toBe('2026-07-19')
    })

    it('should format single digit months and days with leading zeros', () => {
      const mockDate = new Date(2026, 0, 5) // Jan 5, 2026
      expect(getTodayDateString(mockDate)).toBe('2026-01-05')
    })
  })

  describe('formatDeliveryDate', () => {
    it('should format YYYY-MM-DD date into DD-MMM-YYYY format', () => {
      expect(formatDeliveryDate('2026-07-19')).toBe('19-Jul-2026')
      expect(formatDeliveryDate('2026-01-05')).toBe('05-Jan-2026')
      expect(formatDeliveryDate('2026-12-31')).toBe('31-Dec-2026')
    })

    it('should handle ISO date strings with timestamps', () => {
      expect(formatDeliveryDate('2026-07-19T10:30:00.000Z')).toBe('19-Jul-2026')
    })

    it('should return fallback dash when date string is null or empty', () => {
      expect(formatDeliveryDate(null)).toBe('-')
      expect(formatDeliveryDate('')).toBe('-')
    })
  })
})
