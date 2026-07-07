export interface Category {
  id: string
  company_id: string
  name_en: string
  name_th: string
  parent_id?: string | null
  level: number
  is_active: boolean
  sort_order: number
  image_url?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CategoryFormData {
  name_en: string
  name_th: string
  parent_id?: string | null
  level: number
  is_active: boolean
  sort_order: number
  image_url?: string | null
}
