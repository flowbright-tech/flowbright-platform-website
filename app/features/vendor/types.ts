export type SupplyCategory = 'raw_materials' | 'it_hardware' | 'logistics' | 'office_supplies'

export interface Vendor {
  id: string
  code: string
  name: string
  taxId: string
  regId: string
  phone: string
  category: SupplyCategory
  tenantId: string
  createdAt: string
}

export interface VendorFormData {
  name: string
  taxId: string
  regId: string
  phone: string
  category: SupplyCategory
}
