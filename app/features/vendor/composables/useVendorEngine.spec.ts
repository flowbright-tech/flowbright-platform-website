import { describe, it, expect, beforeEach } from 'vitest'
import { useVendorEngine } from './useVendorEngine'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

describe('Vendor Engine Domain Logic', () => {
  beforeEach(() => {
    const { switchTenant } = useAuthEngine()
    switchTenant('tenant-bkk-01')
  })

  it('should filter vendor records by supply category', () => {
    const { selectedCategory, filteredVendors } = useVendorEngine()
    selectedCategory.value = 'it_hardware'
    expect(filteredVendors.value.every(v => v.category === 'it_hardware')).toBe(true)
  })

  it('should validate national tax identifier formats', () => {
    const { validateTaxId } = useVendorEngine()
    expect(validateTaxId('0107537000889')).toBe(true)
    expect(validateTaxId('')).toBe(false)
    expect(validateTaxId('123')).toBe(false)
  })

  it('should create new vendor entry with schema fields', () => {
    const { addVendor, tenantVendors } = useVendorEngine()
    const newVendor = addVendor({
      name: 'Global Chipsets Co.',
      taxId: '0105559998877',
      regId: 'REG-2026-7788',
      phone: '+66 2 888 7766',
      category: 'it_hardware'
    })

    expect(newVendor.taxId).toBe('0105559998877')
    expect(tenantVendors.value.some(v => v.id === newVendor.id)).toBe(true)
  })
})
