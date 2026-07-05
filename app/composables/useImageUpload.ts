import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useRuntimeConfig } from '#imports'

export const useImageUpload = () => {
  const { session, refreshSessionToken, logout } = useAuthEngine()
  const config = useRuntimeConfig()
  const apiDomain = config?.public?.apiDomain || 'https://flowbright-platform-api.onrender.com'

  const uploadImage = async (base64Data: string, folder: string): Promise<string | null> => {
    const token = session.value?.token
    if (!token) throw new Error('Authentication required')

    // Convert base64 data to Blob
    const dataURLtoBlob = (dataurl: string) => {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    }

    const blob = dataURLtoBlob(base64Data)
    const formData = new FormData()
    formData.append('file', blob, `upload_${Date.now()}.png`)

    const makeUploadRequest = async (activeToken: string) => {
      return await fetch(`${apiDomain}/api/v1/uploads/image?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        },
        body: formData
      })
    }

    let res = await makeUploadRequest(token)

    if (res.status === 401 || res.status === 403) {
      const newToken = await refreshSessionToken()
      if (newToken) {
        res = await makeUploadRequest(newToken)
      } else {
        await logout()
        if (import.meta.client) {
          window.location.href = '/login'
        }
        throw new Error('Session expired. Logging out...')
      }
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Failed to upload image: ${res.status}`)
    }

    const json = await res.json()
    if (json.success && json.data?.url) {
      return json.data.url
    }

    throw new Error(json.error || 'Failed to upload image')
  }

  return {
    uploadImage
  }
}
