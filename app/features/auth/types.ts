export interface Tenant {
  id: string
  name: string
  code: string
  region: string
  currency: string
}

export interface UserSession {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  token: string
  refreshToken?: string
}

export interface CompanyProfile {
  id: string
  name_th: string
  name_en: string
  tax_id: string
  phone: string
  email: string
  address_th: string
  address_en: string
  plan: string
  status: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  company_id: string
  first_name_th: string
  last_name_th: string
  first_name_en: string
  last_name_en: string
  role: string
  phone: string
  is_active: boolean
  prefix_th: string
  prefix_en: string
  gender: string
  email: string
  created_at: string
  updated_at: string
  company: CompanyProfile
}

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-bkk-01',
    name: 'FlowBright Tech (HQ - Bangkok)',
    code: 'FB-BANGKOK-01',
    region: 'Thailand (TH)',
    currency: 'THB'
  },
  {
    id: 'tenant-sg-02',
    name: 'FlowBright International (Singapore)',
    code: 'FB-SINGAPORE-02',
    region: 'Singapore (SG)',
    currency: 'SGD'
  },
  {
    id: 'tenant-cnx-03',
    name: 'FlowBright Logistics (Chiang Mai)',
    code: 'FB-CHIANGMAI-03',
    region: 'Thailand (TH)',
    currency: 'THB'
  }
]

