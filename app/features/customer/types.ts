export type CustomerSegment = 'enterprise' | 'sme' | 'retail'
export type CustomerStatus = 'active' | 'suspended' | 'lead'

export interface Customer {
  id: string
  code: string
  name: string
  email: string
  phone: string
  segment: CustomerSegment
  status: CustomerStatus
  tenantId: string
  createdAt: string
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  segment: CustomerSegment
  status: CustomerStatus
}
