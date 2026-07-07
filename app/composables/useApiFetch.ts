import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useAppToast } from './useAppToast'
import { useRuntimeConfig } from '#imports'

export const useApiFetch = () => {
  const { session, logout, refreshSessionToken } = useAuthEngine()
  const { showError } = useAppToast()
  const config = useRuntimeConfig()
  const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const token = session.value?.token
    if (!token) {
      const errMsg = 'Authentication required'
      showError(errMsg)
      throw new Error(errMsg)
    }

    const makeRequest = async (activeToken: string) => {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${activeToken}`,
        ...options.headers
      }

      // Do not overwrite Content-Type for FormData uploads (browser handles boundary automatically)
      if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }

      return await fetch(`${apiDomain}${path}`, {
        method: 'GET',
        ...options,
        headers
      })
    }

    let res = await makeRequest(token)

    // Handle token expiration / unauthorized responses (401 or 403)
    if (res.status === 401 || res.status === 403) {
      const newToken = await refreshSessionToken()
      if (newToken) {
        // Retry the original request with the fresh token
        res = await makeRequest(newToken)
      } else {
        // Refresh failed, clear session and log out
        await logout()
        if (import.meta.client) {
          window.location.href = '/login'
        }
        const errMsg = 'Session expired. Logging out...'
        showError(errMsg)
        throw new Error(errMsg)
      }
    }

    // Show error toast for any non-ok response
    if (!res.ok) {
      const errData = await res.clone().json().catch(() => ({}))
      const errMsg = errData.message || errData.error || `Action failed with status: ${res.status}`
      showError(errMsg)
    }

    return res
  }

  return {
    apiFetch
  }
}
