export interface Product {
  id: string
  company_id: string
  name_th: string
  name_en: string
  sku: string
  barcode: string
  product_type: string
  subcategory_id?: string | null
  selling_price: number
  cost: number
  stock: number
  reserve_stock: number
  unit: string
  description?: string | null
  image_url?: string | null
  is_active: boolean
  created_by?: string | null
  updated_by?: string | null
  created_at?: string | null
  updated_at?: string | null
  remark?: string | null
  leadtime?: string | null
  sample_type_volum?: string | null
  storage_condition?: string | null
  collection_remark?: string | null
  principle?: string | null
  method?: string | null
  clinical_use?: string | null
  reference_range_unit?: string | null
}

export interface ProductFormData {
  name_th: string
  name_en: string
  sku: string
  barcode: string
  product_type: string
  subcategory_id?: string | null
  selling_price: number
  cost: number
  stock: number
  reserve_stock: number
  unit: string
  description?: string | null
  image_url?: string | null
  is_active: boolean
  remark?: string | null
  leadtime?: string | null
  sample_type_volum?: string | null
  storage_condition?: string | null
  collection_remark?: string | null
  principle?: string | null
  method?: string | null
  clinical_use?: string | null
  reference_range_unit?: string | null
}
