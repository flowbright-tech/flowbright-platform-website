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

