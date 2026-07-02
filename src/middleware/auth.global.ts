import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useLocalePath } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthEngine()
  const localePath = useLocalePath()

  // Standardize paths to check if they match login routes
  const isLoginRoute = to.path.endsWith('/login')

  // If not authenticated and trying to access any page other than login, redirect
  if (!isAuthenticated.value && !isLoginRoute) {
    return navigateTo(localePath('/login'))
  }

  // If authenticated and trying to access login or root, redirect to dashboard
  if (isAuthenticated.value && (isLoginRoute || to.path === '/' || to.path === '/en')) {
    return navigateTo(localePath('/dashboard'))
  }
})
