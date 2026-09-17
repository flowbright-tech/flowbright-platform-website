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

  const isStore = computed(() => {
    initializeFromStorage()
    return companyProfileState.value?.company_type?.toLowerCase() === 'store'
  })

  const isLogistic = computed(() => {
    initializeFromStorage()
    const compType = (companyProfileState.value?.company_type || (companyProfileState.value as any)?.business_type || '')?.toLowerCase()
    if (compType === 'logistic' || compType === 'logistics') return true
    const tenantName = activeTenant.value?.name?.toLowerCase() || ''
    if (tenantName.includes('logistic')) return true
    return false
  })

  const isPos = computed(() => {
    initializeFromStorage()
    const compType = (companyProfileState.value?.company_type || (companyProfileState.value as any)?.business_type || '')?.toLowerCase()
    if (compType === 'pos' || compType === 'store') return true
    const tenantName = activeTenant.value?.name?.toLowerCase() || ''
    if (tenantName.includes('pos')) return true
    return false
  })

  const isLinebot = computed(() => {
    initializeFromStorage()
    const compType = (companyProfileState.value?.company_type || (companyProfileState.value as any)?.business_type || '')?.toLowerCase()
    if (compType === 'linebot' || compType === 'line_bot' || compType === 'line-bot') return true
    const tenantName = activeTenant.value?.name?.toLowerCase() || ''
    if (tenantName.includes('linebot') || tenantName.includes('line bot') || tenantName.includes('line-bot')) return true
    return false
  })

  const isSimplifiedCompany = computed(() => {
    initializeFromStorage()
    const compType = (companyProfileState.value?.company_type || (companyProfileState.value as any)?.business_type || '')?.toLowerCase()
    if (compType === 'logistic' || compType === 'logistics' || compType === 'pos' || compType === 'linebot' || compType === 'line_bot' || compType === 'line-bot') return true
    const tenantName = activeTenant.value?.name?.toLowerCase() || ''
    if (tenantName.includes('logistic') || tenantName.includes('pos') || tenantName.includes('linebot') || tenantName.includes('line bot') || tenantName.includes('line-bot')) return true
    return false
  })

  const isAdmin = computed(() => {
    initializeFromStorage()
    const r = (userProfileState.value?.role || session.value?.role || '').toLowerCase()
    // Treat roles with 'admin' or 'manager' as Admin; 'user' as non-admin
    if (r === 'user') return false
    return r.includes('admin') || r.includes('manager') || r === 'system administrator' || r === ''
  })

  const setCompanyType = (type: 'lab' | 'standard' | 'store' | 'logistic' | 'logistics' | 'pos' | 'linebot' | 'line_bot' | 'line-bot' | string) => {
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
        credit_card_percent_charge: 3,
        credit_card_charge_percent: 3,
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

  const requestPasswordReset = async (email: string, redirectTo: string) => {
    const config = useRuntimeConfig()
    const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'
    const res = await fetch(`${apiDomain}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        redirect_to: redirectTo
      })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error?.message || data.message || `Password reset request failed: ${res.status}`)
    }
    return data
  }

  const updatePassword = async (newPassword: string, token?: string) => {
    const config = useRuntimeConfig()
    const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'
    const authToken = token || session.value?.token
    if (!authToken) {
      throw new Error('Authorization token is required to reset password')
    }

    const res = await fetch(`${apiDomain}/api/v1/auth/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        new_password: newPassword
      })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error?.message || data.message || `Failed to update password: ${res.status}`)
    }
    return data
  }

  return {
    session,
    tenants,
    activeTenant,
    isAuthenticated,
    clearSession,
    logout,
    refreshSessionToken,
    requestPasswordReset,
    updatePassword,
    switchTenant,
    login,
    loginWithProfile,
    user,
    company,
    isLab,
    isStore,
    isLogistic,
    isPos,
    isLinebot,
    isSimplifiedCompany,
    isLogisticOrPos: isSimplifiedCompany,
    isAdmin,
    setCompanyType,
    setUserRole
  }
}

export interface PasswordValidationRules {
  minLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  isValid: boolean
}

export const validatePasswordRules = (pwd: string): PasswordValidationRules => {
  const minLength = (pwd || '').length >= 6
  const hasUpper = /[A-Z]/.test(pwd || '')
  const hasLower = /[a-z]/.test(pwd || '')
  const hasNumber = /[0-9]/.test(pwd || '')
  const isValid = minLength && hasUpper && hasLower && hasNumber
  return { minLength, hasUpper, hasLower, hasNumber, isValid }
}

export interface RecoveryDetails {
  token: string | null
  refreshToken: string | null
  type: string | null
  error: string | null
  errorCode: string | null
  errorDescription: string | null
}

/**
 * Extracts Supabase Auth recovery credentials and error metadata from URL hash,
 * URL query string, or Vue Route objects.
 * Supports:
 * - Supabase implicit flow hash: `#access_token=...&refresh_token=...&type=recovery`
 * - Supabase token_hash / PKCE: `?token_hash=...&type=recovery` or `?code=...`
 * - Supabase error hashes/queries: `#error=access_denied&error_code=otp_expired&error_description=...`
 */
export const extractRecoveryDetails = (
  routeOrQuery?: { query?: Record<string, any>; hash?: string } | Record<string, any>
): RecoveryDetails => {
  let token: string | null = null
  let refreshToken: string | null = null
  let type: string | null = null
  let error: string | null = null
  let errorCode: string | null = null
  let errorDescription: string | null = null

  const parseParamString = (paramStr: string) => {
    if (!paramStr) return
    let cleaned = paramStr.replace(/^[#?]+[\/]?/, '')
    if (cleaned.includes('#')) {
      cleaned = cleaned.split('#').pop() || cleaned
    }
    if (cleaned.includes('?')) {
      cleaned = cleaned.split('?').pop() || cleaned
    }

    try {
      const params = new URLSearchParams(cleaned)
      if (!token) {
        token =
          params.get('access_token') ||
          params.get('token') ||
          params.get('token_hash') ||
          params.get('code') ||
          null
      }
      if (!refreshToken) {
        refreshToken = params.get('refresh_token') || null
      }
      if (!type) {
        type = params.get('type') || null
      }
      if (!error) {
        error = params.get('error') || null
      }
      if (!errorCode) {
        errorCode = params.get('error_code') || null
      }
      if (!errorDescription) {
        const rawDesc = params.get('error_description')
        if (rawDesc) {
          errorDescription = decodeURIComponent(rawDesc.replace(/\+/g, ' '))
        }
      }
    } catch {
      // Ignore malformed URI components
    }
  }

  // 1. Check window.location if in browser context
  if (typeof window !== 'undefined') {
    if (window.location.hash) {
      parseParamString(window.location.hash)
    }
    if (window.location.search) {
      parseParamString(window.location.search)
    }
  }

  // 2. Check route object or query object
  if (routeOrQuery) {
    if ('hash' in routeOrQuery && typeof routeOrQuery.hash === 'string' && routeOrQuery.hash) {
      parseParamString(routeOrQuery.hash)
    }

    const queryDict =
      'query' in routeOrQuery && routeOrQuery.query && typeof routeOrQuery.query === 'object'
        ? routeOrQuery.query
        : routeOrQuery

    if (queryDict && typeof queryDict === 'object') {
      if (!token) {
        const qToken = queryDict.access_token || queryDict.token || queryDict.token_hash || queryDict.code
        if (qToken) token = String(qToken)
      }
      if (!refreshToken && queryDict.refresh_token) {
        refreshToken = String(queryDict.refresh_token)
      }
      if (!type && queryDict.type) {
        type = String(queryDict.type)
      }
      if (!error && queryDict.error) {
        error = String(queryDict.error)
      }
      if (!errorCode && queryDict.error_code) {
        errorCode = String(queryDict.error_code)
      }
      if (!errorDescription && queryDict.error_description) {
        errorDescription = decodeURIComponent(String(queryDict.error_description).replace(/\+/g, ' '))
      }
    }
  }

  return { token, refreshToken, type, error, errorCode, errorDescription }
}

export const extractRecoveryToken = (
  routeOrQuery?: { query?: Record<string, any>; hash?: string } | Record<string, any>
): string | null => {
  return extractRecoveryDetails(routeOrQuery).token
}

