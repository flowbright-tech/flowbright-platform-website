import { ref, watch } from 'vue'
import { useState } from '#imports'
import type { AuditLog, AuditLogFilterParams, AuditLogApiResponse, AuditLogUser } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'
import { useApiFetch } from '../../../composables/useApiFetch'

/**
 * Format audit action color for badge display
 */
export const getActionColor = (action: string): 'success' | 'warning' | 'error' | 'neutral' | 'primary' => {
  const upper = (action || '').toUpperCase()
  switch (upper) {
    case 'CREATE':
      return 'success'
    case 'UPDATE':
      return 'warning'
    case 'DELETE':
      return 'error'
    default:
      return 'primary'
  }
}

/**
 * Format audit action icon for UI display
 */
export const getActionIcon = (action: string): string => {
  const upper = (action || '').toUpperCase()
  switch (upper) {
    case 'CREATE':
      return 'i-heroicons-plus-circle'
    case 'UPDATE':
      return 'i-heroicons-pencil-square'
    case 'DELETE':
      return 'i-heroicons-trash'
    default:
      return 'i-heroicons-document-text'
  }
}

/**
 * Format entity type icon for UI display
 */
export const getEntityTypeIcon = (entityType: string): string => {
  const lower = (entityType || '').toLowerCase()
  switch (lower) {
    case 'order':
      return 'i-heroicons-clipboard-document-check'
    case 'product':
    case 'test':
      return 'i-heroicons-shopping-bag'
    case 'customer':
      return 'i-heroicons-user-group'
    case 'vendor':
      return 'i-heroicons-building-storefront'
    case 'product_package':
    case 'package':
      return 'i-heroicons-gift'
    case 'bom':
      return 'i-heroicons-cog-8-tooth'
    case 'category':
      return 'i-heroicons-tag'
    case 'user':
      return 'i-heroicons-user'
    case 'company':
      return 'i-heroicons-building-office'
    default:
      return 'i-heroicons-cube'
  }
}

/**
 * Format audit datetime into readable string
 */
export const formatAuditDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d)
  } catch {
    return dateStr
  }
}

/**
 * Format user display name from AuditLogUser
 */
export const getAuditUserDisplayName = (user?: AuditLogUser | null, locale = 'th'): string => {
  if (!user) return 'System / Unknown'
  if (locale === 'th' && (user.first_name_th || user.last_name_th)) {
    return `${user.prefix_th ? user.prefix_th + ' ' : ''}${user.first_name_th || ''} ${user.last_name_th || ''}`.trim()
  }
  if (user.first_name_en || user.last_name_en) {
    return `${user.prefix_en ? user.prefix_en + ' ' : ''}${user.first_name_en || ''} ${user.last_name_en || ''}`.trim()
  }
  return user.email || user.id || 'User'
}

export const useAuditLogEngine = () => {
  const { session } = useAuthEngine()
  const { apiFetch } = useApiFetch()

  // State refs
  const auditLogs = useState<AuditLog[]>('srp_audit_logs_list', () => [])
  const totalFilteredCount = useState<number>('srp_audit_logs_total', () => 0)
  const isLoading = useState<boolean>('srp_audit_logs_loading', () => false)
  const errorMsg = useState<string | null>('srp_audit_logs_error', () => null)

  // Filter refs
  const searchQuery = ref<string>('')
  const selectedAction = ref<string>('')
  const selectedEntityType = ref<string>('')
  const selectedUserId = ref<string>('')
  const startDate = ref<string>('')
  const endDate = ref<string>('')
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)

  // API Call to fetch audit logs (list)
  const fetchAuditLogs = async (customParams?: AuditLogFilterParams) => {
    const token = session.value?.token
    if (!token) {
      auditLogs.value = []
      totalFilteredCount.value = 0
      return
    }

    isLoading.value = true
    errorMsg.value = null

    try {
      const searchParams = new URLSearchParams()
      
      const page = customParams?.page ?? currentPage.value
      const limit = customParams?.limit ?? pageSize.value
      searchParams.append('page', String(page))
      searchParams.append('limit', String(limit))

      const search = customParams?.search ?? searchQuery.value
      if (search) {
        searchParams.append('search', search)
      }

      const action = customParams?.action ?? selectedAction.value
      if (action) {
        searchParams.append('action', action)
      }

      const entityType = customParams?.entity_type ?? selectedEntityType.value
      if (entityType) {
        searchParams.append('entity_type', entityType)
      }

      const userId = customParams?.user_id ?? selectedUserId.value
      if (userId) {
        searchParams.append('user_id', userId)
      }

      const start = customParams?.start_date ?? startDate.value
      if (start) {
        const isoStart = start.includes('T') ? start : new Date(start).toISOString()
        searchParams.append('start_date', isoStart)
      }

      const end = customParams?.end_date ?? endDate.value
      if (end) {
        const isoEnd = end.includes('T') ? end : new Date(`${end}T23:59:59.999Z`).toISOString()
        searchParams.append('end_date', isoEnd)
      }

      const res = await apiFetch(`/api/v1/audit-logs?${searchParams.toString()}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch audit logs: ${res.status} ${res.statusText}`)
      }

      const json: AuditLogApiResponse = await res.json()
      if (json.success && Array.isArray(json.data)) {
        auditLogs.value = json.data
        totalFilteredCount.value = json.pagination?.total ?? json.data.length
      } else {
        throw new Error(json.message || 'API responded with success: false')
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err)
      errorMsg.value = err.message || 'An error occurred while fetching audit log data'
    } finally {
      isLoading.value = false
    }
  }

  // Reset all filters to default
  const resetFilters = () => {
    searchQuery.value = ''
    selectedAction.value = ''
    selectedEntityType.value = ''
    selectedUserId.value = ''
    startDate.value = ''
    endDate.value = ''
    currentPage.value = 1
    fetchAuditLogs()
  }

  // Client-side watchers for automatic fetch on page or token change
  if (import.meta.client) {
    watch(currentPage, () => {
      fetchAuditLogs()
    })

    watch(() => session.value?.token, (newToken) => {
      if (newToken) {
        currentPage.value = 1
        fetchAuditLogs()
      } else {
        auditLogs.value = []
        totalFilteredCount.value = 0
      }
    })
  }

  return {
    auditLogs,
    totalFilteredCount,
    isLoading,
    errorMsg,
    searchQuery,
    selectedAction,
    selectedEntityType,
    selectedUserId,
    startDate,
    endDate,
    currentPage,
    pageSize,
    fetchAuditLogs,
    resetFilters
  }
}
