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
