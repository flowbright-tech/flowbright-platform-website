import { describe, it, expect } from 'vitest'
import { parseErrorMessage, shouldDedupeToast, resetToastDedupe } from './useAppToast'

describe('parseErrorMessage Centralized Error Parser', () => {
  // Mock translation helpers
  const translations: Record<string, string> = {
    'toast.action_failed': 'Action Failed',
    'toast.validation_error': 'Validation Error',
    'toast.insufficient_stock': 'Insufficient Stock',
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

  it('should format clear error validation message with specific available stock numbers', () => {
    // 1. Real backend error string with item name, available stock, and required quantity
    const realBackendMsg = "BOM item 'Glucose Kit' has insufficient stock (available: 104, required: 9.9999999e+07)"
    const resRealEn = parseErrorMessage(realBackendMsg, mockT, mockTe, 'en')
    expect(resRealEn.title).toBe('Insufficient Stock')
    expect(resRealEn.description).toBe("Available stock for 'Glucose Kit': 104 (Required: 99,999,999)")

    const mockTTh = (key: string) => {
      if (key === 'toast.validation_error') return 'ข้อมูลไม่ถูกต้องตามเงื่อนไข'
      if (key === 'toast.insufficient_stock') return 'สินค้าคงคลังไม่เพียงพอ'
      if (key === 'orders.err_insufficient_stock') return 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ'
      return translations[key] || key
    }

    const resRealTh = parseErrorMessage(realBackendMsg, mockTTh, mockTe, 'th')
    expect(resRealTh.title).toBe('สินค้าคงคลังไม่เพียงพอ')
    expect(resRealTh.description).toBe("คงเหลือในสต็อกสำหรับ 'Glucose Kit': 104 ชิ้น (จำนวนที่ต้องใช้: 99,999,999 ชิ้น)")

    // 2. Available stock is 0
    const zeroStockMsg = "Product 'Glucose Test' has insufficient stock (available: 0, required: 1)"
    const resZeroEn = parseErrorMessage(zeroStockMsg, mockT, mockTe, 'en')
    expect(resZeroEn.title).toBe('Insufficient Stock')
    expect(resZeroEn.description).toBe("Available stock for 'Glucose Test': 0 (Required: 1)")

    const resZeroTh = parseErrorMessage(zeroStockMsg, mockTTh, mockTe, 'th')
    expect(resZeroTh.title).toBe('สินค้าคงคลังไม่เพียงพอ')
    expect(resZeroTh.description).toBe("คงเหลือในสต็อกสำหรับ 'Glucose Test': 0 ชิ้น (จำนวนที่ต้องใช้: 1 ชิ้น)")

    // 3. Available stock number only without item
    const availOnlyMsg = "Insufficient stock: available: 5"
    const resAvailEn = parseErrorMessage(availOnlyMsg, mockT, mockTe, 'en')
    expect(resAvailEn.title).toBe('Insufficient Stock')
    expect(resAvailEn.description).toBe('Available stock: 5')

    const resAvailTh = parseErrorMessage(availOnlyMsg, mockTTh, mockTe, 'th')
    expect(resAvailTh.title).toBe('สินค้าคงคลังไม่เพียงพอ')
    expect(resAvailTh.description).toBe('คงเหลือในสต็อก: 5 ชิ้น')

    // 4. Object error response with structured available_stock field
    const objectError = {
      error: {
        code: 'OUT_OF_STOCK',
        message: 'Insufficient stock in inventory',
        available_stock: 12,
        required_stock: 20,
        product_name: 'CBC Tube'
      }
    }
    const resObjEn = parseErrorMessage(objectError, mockT, mockTe, 'en')
    expect(resObjEn.title).toBe('Insufficient Stock')
    expect(resObjEn.description).toBe("Available stock for 'CBC Tube': 12 (Required: 20)")

    // 5. Natural language regex variations: 'only 3 in stock', 'remaining: 4'
    const naturalMsg = "Product 'Sterile Needle' only has 3 in stock, but order requested: 10"
    const resNaturalEn = parseErrorMessage(naturalMsg, mockT, mockTe, 'en')
    expect(resNaturalEn.title).toBe('Insufficient Stock')
    expect(resNaturalEn.description).toBe("Available stock for 'Sterile Needle': 3 (Required: 10)")

    // 6. Generic stock error without specific numbers falls back cleanly
    const genericMsg = 'Product is out of stock'
    const resGenEn = parseErrorMessage(genericMsg, mockT, mockTe, 'en')
    expect(resGenEn.title).toBe('Insufficient Stock')
    expect(resGenEn.description).toBe('Insufficient stock for product items in this order')

    const resGenTh = parseErrorMessage(genericMsg, mockTTh, mockTe, 'th')
    expect(resGenTh.title).toBe('สินค้าคงคลังไม่เพียงพอ')
    expect(resGenTh.description).toBe('สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ')

    // 7. Non-negative initial stock input error remains distinct from availability errors
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
