export interface PackageItem {
  product_id: string
  quantity: number
  // Optional metadata to store product info for rendering
  product_name_en?: string
  product_name_th?: string
  product_sku?: string
  product_unit?: string
}

export interface Package {
  id: string
  company_id: string
  name_en: string
  name_th: string
  description?: string | null
  image_url?: string | null
  price: number
  items: PackageItem[]
  created_at?: string | null
  updated_at?: string | null
}

export interface PackageFormData {
  name_en: string
  name_th: string
  description: string
  image_url: string
  price: number
  items: {
    product_id: string
    quantity: number
  }[]
}
