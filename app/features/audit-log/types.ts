export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | string

export interface AuditLogUser {
  id: string
  first_name_th?: string | null
  last_name_th?: string | null
  first_name_en?: string | null
  last_name_en?: string | null
  role?: string
  phone?: string | null
  is_active?: boolean
  prefix_th?: string | null
  prefix_en?: string | null
  email?: string
}

export interface AuditLog {
  id: string
  company_id: string
  user_id?: string | null
  action: AuditLogAction
  entity_type: string
  entity_id: string
  details?: Record<string, any> | null
  created_at: string
  user?: AuditLogUser | null
}

export interface AuditLogPagination {
  hasMore: boolean
  page: number
  limit: number
  total: number
}

export interface AuditLogFilterParams {
  action?: string
  entity_type?: string
  user_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export interface AuditLogApiResponse {
  success: boolean
  statusCode?: number
  data: AuditLog[]
  pagination?: AuditLogPagination
  error?: Record<string, any>
  message?: string
}
