import { ref, computed } from 'vue'
import { useCookie } from '#imports'
import { type Tenant, type UserSession, type UserProfile, type CompanyProfile, MOCK_TENANTS } from '../types'

const userProfileState = ref<UserProfile | null>(null)
const companyProfileState = ref<CompanyProfile | null>(null)
const isInitialized = ref(false)

export const useAuthEngine = () => {
  const session = useCookie<UserSession | null>('srp_user_session', {
    default: () => null,
    sameSite: 'strict',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:'
  })

  const initializeFromStorage = () => {
    if (typeof window !== 'undefined' && window.localStorage && !isInitialized.value) {
      try {
        const u = window.localStorage.getItem('srp_user_profile')
        const c = window.localStorage.getItem('srp_company_profile')
        if (u) {
          userProfileState.value = JSON.parse(u)
        }
        if (c) {
          companyProfileState.value = JSON.parse(c)
        }
      } catch (e) {
        console.error('Failed to restore user session profile from local storage', e)
      }
      isInitialized.value = true
    }
  }

  initializeFromStorage()

  const user = computed(() => {
    initializeFromStorage()
    return userProfileState.value
  })

  const company = computed(() => {
    initializeFromStorage()
    return companyProfileState.value
  })

  const tenants = ref<Tenant[]>(MOCK_TENANTS)

  const activeTenant = computed(() => {
    initializeFromStorage()
    if (companyProfileState.value) {
      return {
        id: companyProfileState.value.id,
        name: companyProfileState.value.name_en,
        code: companyProfileState.value.tax_id,
        region: companyProfileState.value.address_en || 'Thailand',
        currency: 'THB'
      }
    }
    return tenants.value.find(t => t.id === session.value?.tenantId) || tenants.value[0]
  })

  const isAuthenticated = computed(() => {
    initializeFromStorage()
    return !!session.value?.token
  })

  /**
   * Executive Session Cleanse Rule (3.2 Tenant Isolation)
   * When a tenant switches accounts or logs out, the frontend memory space
   * must be completely scrubbed to prevent cross-tenant telemetry contamination.
   */
  const clearSession = () => {
    session.value = null
    userProfileState.value = null
    companyProfileState.value = null
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('srp_session')
      window.localStorage.removeItem('srp_tenant_cache')
      window.localStorage.removeItem('srp_user_profile')
      window.localStorage.removeItem('srp_company_profile')
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

  const loginWithProfile = (token: string, userProfile: UserProfile, companyProfile: CompanyProfile) => {
    clearSession()
    session.value = {
      id: userProfile.id,
      email: userProfile.email,
      name: `${userProfile.first_name_en} ${userProfile.last_name_en}`,
      role: userProfile.role,
      tenantId: companyProfile.id,
      token
    }
    userProfileState.value = userProfile
    companyProfileState.value = companyProfile
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('srp_user_profile', JSON.stringify(userProfile))
      window.localStorage.setItem('srp_company_profile', JSON.stringify(companyProfile))
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
    login,
    loginWithProfile,
    user,
    company
  }
}

