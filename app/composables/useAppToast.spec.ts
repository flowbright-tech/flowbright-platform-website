import { describe, it, expect } from 'vitest'
import { parseErrorMessage, shouldDedupeToast, resetToastDedupe } from './useAppToast'

describe('parseErrorMessage Centralized Error Parser', () => {
  // Mock translation helpers
  const translations: Record<string, string> = {
    'toast.action_failed': 'Action Failed',
    'toast.validation_error': 'Validation Error',
    'orders.err_payment_channel_required': 'Please select a payment channel',
    'orders.err_customer_required': 'Please select or specify customer information',
    'errors.not_found': 'Resource not found'
  }

  const mockT = (key: string) => translations[key] || key
  const mockTe = (key: string) => key in translations

  it('should format raw string errors accurately', () => {
    const res = parseErrorMessage('Something went wrong', mockT, mockTe, 'en')
    expect(res.title).toBe('Action Failed')
    expect(res.description).toBe('Something went wrong')
  })

  it('should extract message from Error objects and strip Error: prefix', () => {
    const err = new Error('Database connection failed')
    const res = parseErrorMessage(err, mockT, mockTe, 'en')
    expect(res.title).toBe('Action Failed')
    expect(res.description).toBe('Database connection failed')
  })

  it('should resolve direct translation keys', () => {
    const res = parseErrorMessage('orders.err_payment_channel_required', mockT, mockTe, 'en')
    expect(res.title).toBe('Action Failed')
    expect(res.description).toBe('Please select a payment channel')
  })

  it('should resolve translation keys with namespaced fallbacks', () => {
    const res = parseErrorMessage('err_customer_required', mockT, mockTe, 'en')
    expect(res.title).toBe('Action Failed')
    expect(res.description).toBe('Please select or specify customer information')
  })

  it('should detect validation errors and assign validation error title', () => {
    const res = parseErrorMessage('Validation failed for SKU', mockT, mockTe, 'en')
    expect(res.title).toBe('Validation Error')
    expect(res.description).toBe('Validation failed for SKU')
  })

  it('should translate common backend error messages to Thai when locale is th', () => {
    const res = parseErrorMessage('Failed to create order', mockT, mockTe, 'th')
    expect(res.description).toBe('ไม่สามารถสร้างคำสั่งซื้อได้')

    const res2 = parseErrorMessage('Please select a payment channel', mockT, mockTe, 'th')
    expect(res2.description).toBe('กรุณาเลือกช่องทางการชำระเงิน')
  })

  it('should handle API JSON error response objects', () => {
    const apiError = { data: { message: 'Invalid payload structure' } }
    const res = parseErrorMessage(apiError, mockT, mockTe, 'en')
    expect(res.description).toBe('Invalid payload structure')
  })

  it('should handle empty or null errors gracefully', () => {
    const res = parseErrorMessage(null, mockT, mockTe, 'en')
    expect(res.title).toBe('Action Failed')
    expect(res.description).toBe('Action Failed')
  })

  it('should translate additional form validation phrases to Thai', () => {
    const res1 = parseErrorMessage('Failed to load customers', mockT, mockTe, 'th')
    expect(res1.description).toBe('ไม่สามารถโหลดข้อมูลลูกค้าได้')

    const res2 = parseErrorMessage('BOM must contain at least one item', mockT, mockTe, 'th')
    expect(res2.description).toBe('สูตรการผลิตต้องมีส่วนประกอบอย่างน้อย 1 รายการ')

    const res3 = parseErrorMessage('Invalid credentials', mockT, mockTe, 'th')
    expect(res3.description).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  })

  it('should use the same unified error validation message for all stock validation variants', () => {
    // English locale: all variations return the exact same unified message
    const stockVariants = [
      'Insufficient stock for product PROD-001',
      'Product is out of stock',
      'Quantity exceeds available stock',
      'Not enough stock in inventory',
      'Stock is insufficient for this order'
    ]

    for (const variant of stockVariants) {
      const resEn = parseErrorMessage(variant, mockT, mockTe, 'en')
      expect(resEn.title).toBe('Validation Error')
      expect(resEn.description).toBe('Insufficient stock for product items in this order')
    }

    // Thai locale: all variations return the exact same unified Thai message
    const mockTTh = (key: string) => {
      if (key === 'toast.validation_error') return 'ข้อมูลไม่ถูกต้องตามเงื่อนไข'
      if (key === 'orders.err_insufficient_stock') return 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ'
      return translations[key] || key
    }

    for (const variant of stockVariants) {
      const resTh = parseErrorMessage(variant, mockTTh, mockTe, 'th')
      expect(resTh.title).toBe('ข้อมูลไม่ถูกต้องตามเงื่อนไข')
      expect(resTh.description).toBe('สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ')
    }

    // Non-negative initial stock input error remains distinct from availability errors
    const nonNegativeEn = parseErrorMessage('Stock count must be a non-negative number', mockT, mockTe, 'en')
    expect(nonNegativeEn.description).toBe('Stock count must be a non-negative number')

    const nonNegativeTh = parseErrorMessage('Stock count must be a non-negative number', mockTTh, mockTe, 'th')
    expect(nonNegativeTh.description).toBe('จำนวนสต็อกต้องไม่ติดลบ')
  })
})

describe('shouldDedupeToast Deduplication Engine', () => {
  it('should deduplicate identical toast keys within 1500ms window', () => {
    const record = { key: 'validation error::insufficient stock', timestamp: 1000 }

    // Identical key at timestamp 1100 (100ms later)
    const isDupe = shouldDedupeToast('validation error::insufficient stock', record, 1500, 1100)
    expect(isDupe).toBe(true)

    // Identical key at timestamp 2499 (1499ms later)
    const isDupeNearLimit = shouldDedupeToast('validation error::insufficient stock', record, 1500, 2499)
    expect(isDupeNearLimit).toBe(true)
  })

  it('should allow toast when time window exceeds 1500ms', () => {
    const record = { key: 'validation error::insufficient stock', timestamp: 1000 }

    // Timestamp 2501 (1501ms later)
    const isDupe = shouldDedupeToast('validation error::insufficient stock', record, 1500, 2501)
    expect(isDupe).toBe(false)
  })

  it('should allow different toast keys even within the same millisecond', () => {
    const record = { key: 'validation error::insufficient stock', timestamp: 1000 }

    const isDupe = shouldDedupeToast('validation error::payment channel required', record, 1500, 1000)
    expect(isDupe).toBe(false)
  })

  it('should not dedupe when newKey is empty', () => {
    const record = { key: '', timestamp: 1000 }
    const isDupe = shouldDedupeToast('', record, 1500, 1000)
    expect(isDupe).toBe(false)
  })

  it('should reset deduplication records cleanly with resetToastDedupe', () => {
    expect(typeof resetToastDedupe).toBe('function')
    expect(() => resetToastDedupe()).not.toThrow()
  })
})
