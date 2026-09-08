import { vi, describe, it, expect } from 'vitest'
import { useAuthEngine, validatePasswordRules, extractRecoveryToken, extractRecoveryDetails } from './useAuthEngine'
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

  it('should evaluate isStore correctly when company_type is store', () => {
    const { setCompanyType, isStore } = useAuthEngine()
    setCompanyType('store')
    expect(isStore.value).toBe(true)

    setCompanyType('lab')
    expect(isStore.value).toBe(false)

    setCompanyType('standard')
    expect(isStore.value).toBe(false)
  })

  it('should evaluate isLogistic correctly when company_type is logistic or logistics', () => {
    const { setCompanyType, isLogistic } = useAuthEngine()
    setCompanyType('logistic')
    expect(isLogistic.value).toBe(true)

    setCompanyType('logistics')
    expect(isLogistic.value).toBe(true)

    setCompanyType('lab')
    expect(isLogistic.value).toBe(false)

    setCompanyType('standard')
    expect(isLogistic.value).toBe(false)
  })

  it('should evaluate isPos correctly when company_type is pos or store', () => {
    const { setCompanyType, isPos } = useAuthEngine()
    setCompanyType('pos')
    expect(isPos.value).toBe(true)

    setCompanyType('store')
    expect(isPos.value).toBe(true)

    setCompanyType('lab')
    expect(isPos.value).toBe(false)

    setCompanyType('standard')
    expect(isPos.value).toBe(false)
  })

  it('should evaluate isAdmin correctly based on user role', () => {
    const { login, setUserRole, isAdmin } = useAuthEngine()
    login('user@flowbright.co', 'mock-token', MOCK_TENANTS[0].id)
    setUserRole('user')
    expect(isAdmin.value).toBe(false)

    setUserRole('admin')
    expect(isAdmin.value).toBe(true)
  })

  describe('validatePasswordRules', () => {
    it('should reject passwords shorter than 6 characters', () => {
      const { minLength, isValid } = validatePasswordRules('Ab1')
      expect(minLength).toBe(false)
      expect(isValid).toBe(false)
    })

    it('should reject passwords missing uppercase letters', () => {
      const { hasUpper, isValid } = validatePasswordRules('secret123')
      expect(hasUpper).toBe(false)
      expect(isValid).toBe(false)
    })

    it('should reject passwords missing lowercase letters', () => {
      const { hasLower, isValid } = validatePasswordRules('SECRET123')
      expect(hasLower).toBe(false)
      expect(isValid).toBe(false)
    })

    it('should reject passwords missing numbers', () => {
      const { hasNumber, isValid } = validatePasswordRules('SecretPassword')
      expect(hasNumber).toBe(false)
      expect(isValid).toBe(false)
    })

    it('should accept passwords meeting all uppercase, lowercase, number, and length >= 6 criteria', () => {
      const res = validatePasswordRules('FlowBright2026')
      expect(res.minLength).toBe(true)
      expect(res.hasUpper).toBe(true)
      expect(res.hasLower).toBe(true)
      expect(res.hasNumber).toBe(true)
      expect(res.isValid).toBe(true)
    })
  })

  describe('extractRecoveryToken & extractRecoveryDetails (Supabase Auth support)', () => {
    it('should extract token from route query access_token or token or code or token_hash', () => {
      expect(extractRecoveryToken({ access_token: 'rec-jwt-token-123' })).toBe('rec-jwt-token-123')
      expect(extractRecoveryToken({ token: 'rec-token-456' })).toBe('rec-token-456')
      expect(extractRecoveryToken({ code: 'rec-code-789' })).toBe('rec-code-789')
      expect(extractRecoveryToken({ token_hash: 'rec-hash-999' })).toBe('rec-hash-999')
    })

    it('should extract Supabase recovery details from hash fragment', () => {
      const hash = '#access_token=supabase.jwt.token&refresh_token=mock-refresh-token&expires_at=1725800000&expires_in=3600&token_type=bearer&type=recovery'
      const details = extractRecoveryDetails({ hash, query: {} })

      expect(details.token).toBe('supabase.jwt.token')
      expect(details.refreshToken).toBe('mock-refresh-token')
      expect(details.type).toBe('recovery')
      expect(details.error).toBeNull()
      expect(details.errorDescription).toBeNull()
    })

    it('should extract Supabase error details from hash fragment when link is expired or invalid', () => {
      const hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'
      const details = extractRecoveryDetails({ hash, query: {} })

      expect(details.token).toBeNull()
      expect(details.error).toBe('access_denied')
      expect(details.errorCode).toBe('otp_expired')
      expect(details.errorDescription).toBe('Email link is invalid or has expired')
    })

    it('should extract Supabase error details from query parameters', () => {
      const query = {
        error: 'unauthorized_client',
        error_code: '401',
        error_description: 'Token+has+expired'
      }
      const details = extractRecoveryDetails({ query })

      expect(details.token).toBeNull()
      expect(details.error).toBe('unauthorized_client')
      expect(details.errorCode).toBe('401')
      expect(details.errorDescription).toBe('Token has expired')
    })

    it('should return null/empty when no token is present in route query or hash', () => {
      expect(extractRecoveryToken({})).toBeNull()
      expect(extractRecoveryToken(undefined)).toBeNull()
      const details = extractRecoveryDetails({})
      expect(details.token).toBeNull()
      expect(details.error).toBeNull()
    })
  })

  describe('requestPasswordReset & updatePassword API calls', () => {
    it('should send POST request to /auth/reset-password with email and redirect_to', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { message: 'Password reset email sent successfully' } })
      })
      vi.stubGlobal('fetch', mockFetch)

      const { requestPasswordReset } = useAuthEngine()
      const res = await requestPasswordReset('test@flowbright.co', 'http://localhost:3000/resetpassword')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/reset-password'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            email: 'test@flowbright.co',
            redirect_to: 'http://localhost:3000/resetpassword'
          })
        })
      )
      expect(res.success).toBe(true)
    })

    it('should send PUT request to /auth/password with Authorization header and new_password', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { message: 'Password updated successfully' } })
      })
      vi.stubGlobal('fetch', mockFetch)

      const { updatePassword } = useAuthEngine()
      const res = await updatePassword('NewSecret123', 'rec-token-xyz')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/password'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer rec-token-xyz',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            new_password: 'NewSecret123'
          })
        })
      )
      expect(res.success).toBe(true)
    })

    it('should throw error when updatePassword is called without a token', async () => {
      const { updatePassword, clearSession } = useAuthEngine()
      clearSession()
      await expect(updatePassword('NewSecret123', undefined)).rejects.toThrow('Authorization token is required')
    })
  })
})
