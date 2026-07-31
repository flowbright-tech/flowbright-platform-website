import { describe, it, expect } from 'vitest'
import { useAuthEngine } from './useAuthEngine'
import { MOCK_TENANTS } from '../types'

describe('Auth Engine & Tenant Memory Cleansing', () => {
  it('should initialize with no user session by default', () => {
    const { isAuthenticated, session } = useAuthEngine()
    expect(isAuthenticated.value).toBe(false)
    expect(session.value).toBeNull()
  })

  it('should set session correctly after login()', () => {
    const { login, session, isAuthenticated, activeTenant } = useAuthEngine()
    login('admin@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    expect(isAuthenticated.value).toBe(true)
    expect(session.value?.email).toBe('admin@flowbright.co')
    expect(activeTenant.value.id).toBe(MOCK_TENANTS[0].id)
  })

  it('should scrub session memory upon invoking clearSession()', () => {
    const { login, session, clearSession, isAuthenticated } = useAuthEngine()
    login('admin@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    clearSession()
    expect(session.value).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })

  it('should switch tenants and re-initialize session with target tenant ID', () => {
    const { login, switchTenant, activeTenant, session } = useAuthEngine()
    login('admin@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    switchTenant('tenant-sg-02')
    expect(session.value?.tenantId).toBe('tenant-sg-02')
    expect(activeTenant.value.code).toBe('FB-SINGAPORE-02')
  })

  it('should evaluate isLab correctly when company_type is lab', () => {
    const { setCompanyType, isLab } = useAuthEngine()
    setCompanyType('lab')
    expect(isLab.value).toBe(true)

    setCompanyType('standard')
    expect(isLab.value).toBe(false)
  })

  it('should evaluate isAdmin correctly based on user role', () => {
    const { login, setUserRole, isAdmin } = useAuthEngine()
    login('user@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    setUserRole('user')
    expect(isAdmin.value).toBe(false)

    setUserRole('admin')
    expect(isAdmin.value).toBe(true)
  })
})
