import { ref, computed } from 'vue'
import { useState } from '#imports'
import { type Tenant, type UserSession, MOCK_TENANTS } from '../types'

export const useAuthEngine = () => {
  const session = useState<UserSession | null>('srp_user_session', () => null)

  const tenants = ref<Tenant[]>(MOCK_TENANTS)

  const activeTenant = computed(() => {
    return tenants.value.find(t => t.id === session.value?.tenantId) || tenants.value[0]
  })

  const isAuthenticated = computed(() => !!session.value?.token)

  /**
   * Executive Session Cleanse Rule (3.2 Tenant Isolation)
   * When a tenant switches accounts or logs out, the frontend memory space
   * must be completely scrubbed to prevent cross-tenant telemetry contamination.
   */
  const clearSession = () => {
    session.value = null
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('srp_session')
      window.localStorage.removeItem('srp_tenant_cache')
    }
  }

  const switchTenant = (newTenantId: string) => {
    // Scrub active session memory before assigning new tenant context
    const currentEmail = session.value?.email || 'admin@flowbright.co'
    clearSession()

    // Re-initialize session under target tenant ID
    session.value = {
      id: 'usr-admin-01',
      email: currentEmail,
      name: 'Chanchai J.',
      role: 'System Administrator',
      tenantId: newTenantId,
      token: `mock_jwt_token_${newTenantId}`
    }
  }

  const login = (email: string, token: string, tenantId?: string) => {
    clearSession()
    session.value = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role: 'Enterprise Manager',
      tenantId: tenantId || MOCK_TENANTS[0].id,
      token
    }
    return true
  }

  return {
    session,
    tenants,
    activeTenant,
    isAuthenticated,
    clearSession,
    switchTenant,
    login
  }
}
