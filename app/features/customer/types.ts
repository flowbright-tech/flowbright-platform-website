export interface Customer {
  id: string
  company_id: string
  prefix_en?: string
  prefix_th?: string
  first_name_th?: string
  last_name_th?: string
  first_name_en?: string
  last_name_en?: string
  phone: string
  email: string
  address_th?: string
  address_en?: string
  gender?: string
  created_by?: string
  created_at: string
  updated_at: string
  tax_id?: string
  type: string
  image_url?: string
  is_active: boolean
  code: string
  nationality?: string
  birth_date?: string
  id_card?: string
  passport?: string
  occupation?: string
  social_media?: string // JSON string
}

export interface CustomerFormData {
  prefix_en: string
  prefix_th: string
  first_name_th: string
  last_name_th: string
  first_name_en: string
  last_name_en: string
  phone: string
  email: string
  address_th: string
  address_en: string
  gender: string
  tax_id: string
  type: string
  is_active: boolean
  nationality: string
  birth_date: string
  id_card: string
  passport: string
  occupation: string
  social_media: string // JSON representation or fields
}
