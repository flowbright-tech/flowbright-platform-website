import { describe, it, expect, beforeEach } from 'vitest'
import authMiddleware from './auth.global'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'

describe('Global Auth Middleware (auth.global.ts)', () => {
  const { clearSession, login } = useAuthEngine()

  beforeEach(() => {
    clearSession()
  })

  describe('Unauthenticated User', () => {
    it('should allow navigation to /login without redirection', () => {
      const result = authMiddleware({ path: '/login', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to localized /en/login', () => {
      const result = authMiddleware({ path: '/en/login', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to /forgot-password', () => {
      const result = authMiddleware({ path: '/forgot-password', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to /forgotpassword (alias)', () => {
      const result = authMiddleware({ path: '/forgotpassword', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to localized /en/forgot-password', () => {
      const result = authMiddleware({ path: '/en/forgot-password', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to /reset-password', () => {
      const result = authMiddleware({ path: '/reset-password', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to /resetpassword (alias)', () => {
      const result = authMiddleware({ path: '/resetpassword', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to pages configured with meta.layout = auth', () => {
      const result = authMiddleware({ path: '/custom-auth-page', meta: { layout: 'auth' } } as any)
      expect(result).toBeUndefined()
    })

    it('should allow navigation to pages configured with meta.auth = false', () => {
      const result = authMiddleware({ path: '/public-showcase', meta: { auth: false } } as any)
      expect(result).toBeUndefined()
    })

    it('should redirect unauthenticated users visiting protected pages to /login', () => {
      const resultOrders = authMiddleware({ path: '/orders', meta: {} } as any)
      expect(resultOrders).toEqual({ to: '/login', redirected: true })

      const resultRoot = authMiddleware({ path: '/', meta: {} } as any)
      expect(resultRoot).toEqual({ to: '/login', redirected: true })

      const resultProducts = authMiddleware({ path: '/products', meta: {} } as any)
      expect(resultProducts).toEqual({ to: '/login', redirected: true })
    })

    it('should forward Supabase Auth recovery redirects landing on root to /resetpassword preserving hash', () => {
      const hash = '#access_token=jwt_supa_123&refresh_token=rt_456&type=recovery'
      const result = authMiddleware({ path: '/', hash, meta: {} } as any)
      expect(result).toEqual({ to: `/resetpassword${hash}`, redirected: true })
    })

    it('should forward Supabase Auth recovery query landing on root to /resetpassword preserving query params', () => {
      const result = authMiddleware({ path: '/', query: { token_hash: 'pkce_789', type: 'recovery' }, meta: {} } as any)
      expect(result).toEqual({ to: '/resetpassword?token_hash=pkce_789&type=recovery', redirected: true })
    })
  })

  describe('Authenticated User', () => {
    beforeEach(() => {
      login('test@example.com', 'test-valid-jwt-token')
    })

    it('should allow access to protected app routes', () => {
      const result = authMiddleware({ path: '/orders', meta: {} } as any)
      expect(result).toBeUndefined()
    })

    it('should redirect authenticated users away from /login to /', () => {
      const result = authMiddleware({ path: '/login', meta: {} } as any)
      expect(result).toEqual({ to: '/', redirected: true })
    })

    it('should redirect authenticated users away from /forgot-password to /', () => {
      const result = authMiddleware({ path: '/forgot-password', meta: {} } as any)
      expect(result).toEqual({ to: '/', redirected: true })
    })

    it('should redirect legacy /dashboard route to /', () => {
      const result = authMiddleware({ path: '/dashboard', meta: {} } as any)
      expect(result).toEqual({ to: '/', redirected: true })
    })

    it('should allow access to /reset-password if authenticated user has token link', () => {
      const result = authMiddleware({ path: '/reset-password', meta: {} } as any)
      expect(result).toBeUndefined()
    })
  })
})
