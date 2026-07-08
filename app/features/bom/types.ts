export interface BomItem {
  name_en: string
  name_th: string
  quantity: number
  remark: string
  reserve_stock: number
  stock: number
  unit: string
}

export interface Bom {
  id: string
  company_id: string
  bom_name: string
  product_id: string
  product?: {
    id: string
    name_en: string
    name_th: string
    sku: string
  } | null
  version: number
  items: BomItem[]
  is_active?: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface BomFormData {
  bom_name: string
  product_id: string
  version: number
  items: BomItem[]
}
