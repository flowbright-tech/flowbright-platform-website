import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useLocalePath } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthEngine()
  const localePath = useLocalePath()

  // Standardize and normalize path
  const cleanPath = to.path.replace(/\/$/, '') || '/'

  // Public authentication routes (support kebab-case and plain aliases, with or without locale prefix)
  const publicAuthPaths = [
    '/login',
    '/forgot-password',
    '/forgotpassword',
    '/reset-password',
    '/resetpassword'
  ]

  const isPublicAuthRoute =
    publicAuthPaths.some(p => cleanPath === p || cleanPath.endsWith(p)) ||
    to.meta?.layout === 'auth' ||
    to.meta?.auth === false

  const isResetPasswordRoute =
    cleanPath === '/reset-password' ||
    cleanPath === '/resetpassword' ||
    cleanPath.endsWith('/reset-password') ||
    cleanPath.endsWith('/resetpassword')

  // Detect Supabase recovery redirects arriving on non-reset routes (e.g. Site URL fallback landing on '/')
  const hash = (typeof window !== 'undefined' && window.location?.hash) ? window.location.hash : (to.hash || '')
  const query = to.query || {}
  const hasRecoverySignals =
    query.type === 'recovery' ||
    Boolean(query.token_hash) ||
    (typeof hash === 'string' && (hash.includes('type=recovery') || hash.includes('access_token=') || hash.includes('token_hash=')))

  if (hasRecoverySignals && !isResetPasswordRoute) {
    let target = localePath('/resetpassword')
    const searchParams = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) {
        searchParams.set(k, String(v))
      }
    }
    const qStr = searchParams.toString()
    if (qStr) {
      target += `?${qStr}`
    }
    if (hash) {
      target += hash.startsWith('#') ? hash : `#${hash}`
    }
    return navigateTo(target)
  }

  const isDashboardRoute = cleanPath === '/dashboard' || cleanPath.endsWith('/dashboard')

  // If not authenticated and trying to access any page other than public auth pages, redirect to login
  if (!isAuthenticated.value && !isPublicAuthRoute) {
    return navigateTo(localePath('/login'))
  }

  // If authenticated and trying to access login, forgot-password, or dashboard (legacy route), redirect to index page
  const isLoginOrForgotRoute = ['/login', '/forgot-password', '/forgotpassword'].some(
    p => cleanPath === p || cleanPath.endsWith(p)
  )

  if (isAuthenticated.value && (isLoginOrForgotRoute || isDashboardRoute)) {
    return navigateTo(localePath('/'))
  }
})


