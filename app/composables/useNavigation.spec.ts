import { describe, it, expect, beforeEach } from 'vitest'
import { useNavigation } from './useNavigation'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { MOCK_TENANTS } from '../features/auth/types'

describe('useNavigation Composable', () => {
  const { setCompanyType, setUserRole, login } = useAuthEngine()

  beforeEach(() => {
    login('admin@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    setUserRole('admin')
  })

  it('should hide customer navigation item for logistic company type', () => {
    setCompanyType('logistic')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeUndefined()
  })

  it('should hide customer navigation item for pos company type', () => {
    setCompanyType('pos')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeUndefined()
  })

  it('should hide customer navigation item for linebot company type', () => {
    setCompanyType('linebot')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeUndefined()
  })

  it('should show customer navigation item for standard company type', () => {
    setCompanyType('standard')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeDefined()
    expect(customerItem?.to).toBe('/customers')
  })

  it('should show customer navigation item for lab company type', () => {
    setCompanyType('lab')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeDefined()
    expect(customerItem?.to).toBe('/customers')
  })

  it('should show customer navigation item for store company type', () => {
    setCompanyType('store')
    const { navItems } = useNavigation()
    const customerItem = navItems.value.find(item => item.key === 'customers')
    expect(customerItem).toBeDefined()
    expect(customerItem?.to).toBe('/customers')
  })
})
