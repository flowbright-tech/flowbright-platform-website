export interface Vendor {
  id: string
  company_id?: string
  code?: string
  name_th: string
  name_en: string
  contact_name: string
  phone: string
  email: string
  address_th: string
  address_en: string
  tax_id: string
  type: string
  image_url?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface VendorFormData {
  name_th: string
  name_en: string
  contact_name: string
  phone: string
  email: string
  address_th: string
  address_en: string
  tax_id: string
  type: string
  image_url?: string
}
