import { useToast, useI18n } from '#imports'

export const useAppToast = () => {
  const toast = useToast()
  const { t, te } = useI18n()

  const showSuccess = (action: 'create' | 'update' | 'delete', resourceName: string) => {
    const lowerResource = resourceName.toLowerCase()
    const translatedResource = te(`toast.${lowerResource}`) ? t(`toast.${lowerResource}`) : resourceName

    let title = ''
    let description = ''
    let color: 'success' | 'neutral' | 'error' | 'warning' | 'primary' = 'success'
    let icon = ''

    if (action === 'create') {
      title = t('toast.create_title', { resource: translatedResource })
      description = t('toast.create_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-check-circle'
    } else if (action === 'update') {
      title = t('toast.update_title', { resource: translatedResource })
      description = t('toast.update_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-arrow-path'
    } else if (action === 'delete') {
      title = t('toast.delete_title', { resource: translatedResource })
      description = t('toast.delete_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-trash'
    }

    toast.add({
      title,
      description,
      color,
      icon,
      id: `toast-${action}-${Date.now()}`
    })
  }

  const showError = (message: string) => {
    const translatedMessage = te(message) ? t(message) : message
    toast.add({
      title: t('toast.action_failed'),
      description: translatedMessage,
      color: 'error',
      icon: 'i-heroicons-x-circle',
      id: `toast-error-${Date.now()}`
    })
  }

  return {
    showSuccess,
    showError
  }
}
