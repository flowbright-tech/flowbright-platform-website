import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useLocalePath } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthEngine()
  const localePath = useLocalePath()

  // Standardize paths
  const isLoginRoute = to.path.endsWith('/login')
  const isDashboardRoute = to.path.endsWith('/dashboard')

  // If not authenticated and trying to access any page other than login, redirect
  if (!isAuthenticated.value && !isLoginRoute) {
    return navigateTo(localePath('/login'))
  }

  // If authenticated and trying to access login or dashboard (legacy route), redirect to index page
  if (isAuthenticated.value && (isLoginRoute || isDashboardRoute)) {
    return navigateTo(localePath('/'))
  }
})
