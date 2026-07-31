import { ref, computed } from 'vue'
import { useCookie, useRuntimeConfig } from '#imports'
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

  const isLab = computed(() => {
    initializeFromStorage()
    return companyProfileState.value?.company_type?.toLowerCase() === 'lab'
  })

  const isAdmin = computed(() => {
    initializeFromStorage()
    const r = (userProfileState.value?.role || session.value?.role || '').toLowerCase()
    // Treat roles with 'admin' or 'manager' as Admin; 'user' as non-admin
    if (r === 'user') return false
    return r.includes('admin') || r.includes('manager') || r === 'system administrator' || r === ''
  })

  const setCompanyType = (type: 'lab' | 'standard') => {
    if (!companyProfileState.value) {
      companyProfileState.value = {
        id: 'comp-01',
        name_th: 'บริษัท ตัวอย่าง จำกัด',
        name_en: 'Flow Bright Co., Ltd.',
        tax_id: '0105566778899',
        phone: '02-123-4567',
        email: 'contact@flowbright.co',
        address_th: 'กรุงเทพมหานคร',
        address_en: 'Bangkok, Thailand',
        plan: 'enterprise',
        status: 'active',
        image_url: '',
        company_type: type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      companyProfileState.value = {
        ...companyProfileState.value,
        company_type: type
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('srp_company_profile', JSON.stringify(companyProfileState.value))
    }
  }

  const setUserRole = (role: string) => {
    if (userProfileState.value) {
      userProfileState.value = {
        ...userProfileState.value,
        role
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('srp_user_profile', JSON.stringify(userProfileState.value))
      }
    }
    if (session.value) {
      session.value = {
        ...session.value,
        role
      }
    }
  }

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

  const login = (email: string, token: string, tenantId?: string, refreshToken?: string) => {
    clearSession()
    session.value = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role: 'Enterprise Manager',
      tenantId: tenantId || MOCK_TENANTS[0].id,
      token,
      refreshToken
    }
    return true
  }

  const loginWithProfile = (token: string, userProfile: UserProfile, companyProfile: CompanyProfile, refreshToken?: string) => {
    clearSession()
    session.value = {
      id: userProfile.id,
      email: userProfile.email,
      name: `${userProfile.first_name_en} ${userProfile.last_name_en}`,
      role: userProfile.role,
      tenantId: companyProfile.id,
      token,
      refreshToken
    }
    userProfileState.value = userProfile
    companyProfileState.value = companyProfile
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('srp_user_profile', JSON.stringify(userProfile))
      window.localStorage.setItem('srp_company_profile', JSON.stringify(companyProfile))
    }
    return true
  }

  const logout = async () => {
    const token = session.value?.token
    if (token) {
      try {
        const config = useRuntimeConfig()
        const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'
        
        await fetch(`${apiDomain}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (e) {
        console.error('Logout API call failed:', e)
      }
    }
    clearSession()
  }

  const refreshSessionToken = async (): Promise<string | null> => {
    const rfToken = session.value?.refreshToken
    if (!rfToken) return null

    const config = useRuntimeConfig()
    const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'

    try {
      const res = await fetch(`${apiDomain}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: rfToken })
      })

      if (!res.ok) {
        throw new Error(`Token refresh request failed: ${res.status}`)
      }

      const json = await res.json()
      const newToken = json.data?.token || json.token
      const newRefreshToken = json.data?.refresh_token || json.refreshToken || rfToken

      if (newToken && session.value) {
        session.value = {
          ...session.value,
          token: newToken,
          refreshToken: newRefreshToken
        }
        return newToken
      }
    } catch (e) {
      console.error('Failed to automatically refresh session token:', e)
    }
    return null
  }

  return {
    session,
    tenants,
    activeTenant,
    isAuthenticated,
    clearSession,
    logout,
    refreshSessionToken,
    switchTenant,
    login,
    loginWithProfile,
    user,
    company,
    isLab,
    isAdmin,
    setCompanyType,
    setUserRole
  }
}

