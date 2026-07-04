import { describe, it, expect, beforeEach } from 'vitest'
import { useCustomerEngine } from './useCustomerEngine'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

describe('Customer Engine Domain Logic', () => {
  beforeEach(() => {
    const { switchTenant } = useAuthEngine()
    switchTenant('tenant-bkk-01')
  })

  it('should isolate customer records per tenant', () => {
    const { tenantCustomers } = useCustomerEngine()
    expect(tenantCustomers.value.every(c => c.tenantId === 'tenant-bkk-01')).toBe(true)
  })

  it('should correctly filter customers by search query', () => {
    const { searchQuery, filteredCustomers } = useCustomerEngine()
    searchQuery.value = 'Bangkok'
    expect(filteredCustomers.value.length).toBeGreaterThan(0)
    expect(filteredCustomers.value[0].name).toContain('Bangkok')
  })

  it('should create new customer record and prepend to collection', () => {
    const { addCustomer, tenantCustomers } = useCustomerEngine()
    const initialCount = tenantCustomers.value.length

    const created = addCustomer({
      name: 'Test Enterprise Co., Ltd.',
      email: 'test@enterprise.co.th',
      phone: '+66 2 000 1111',
      segment: 'enterprise',
      status: 'active'
    })

    expect(created.id).toBeDefined()
    expect(tenantCustomers.value.length).toBe(initialCount + 1)
    expect(tenantCustomers.value[0].name).toBe('Test Enterprise Co., Ltd.')
  })

  it('should delete a customer record', () => {
    const { deleteCustomer, tenantCustomers } = useCustomerEngine()
    const initialCount = tenantCustomers.value.length
    const targetId = tenantCustomers.value[0].id

    deleteCustomer(targetId)
    expect(tenantCustomers.value.length).toBe(initialCount - 1)
  })
})
