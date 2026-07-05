import { useToast } from '#imports'

export const useAppToast = () => {
  const toast = useToast()

  const showSuccess = (action: 'create' | 'update' | 'delete', resourceName: string) => {
    let title = ''
    let description = ''
    let color: 'success' | 'neutral' | 'error' | 'warning' | 'primary' = 'success'
    let icon = ''

    if (action === 'create') {
      title = `${resourceName} Created`
      description = `A new ${resourceName.toLowerCase()} record has been added successfully.`
      color = 'success'
      icon = 'i-heroicons-check-circle'
    } else if (action === 'update') {
      title = `${resourceName} Updated`
      description = `The ${resourceName.toLowerCase()} profile has been modified successfully.`
      color = 'primary'
      icon = 'i-heroicons-arrow-path'
    } else if (action === 'delete') {
      title = `${resourceName} Deleted`
      description = `The ${resourceName.toLowerCase()} record has been removed from the database.`
      color = 'error'
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
    toast.add({
      title: 'Action Failed',
      description: message,
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
