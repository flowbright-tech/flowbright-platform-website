import { useToast, useI18n } from '#imports'

export interface ParsedToastError {
  title: string
  description: string
}

export const formatNumber = (val: any): string => {
  const n = Number(val)
  return !isNaN(n) ? n.toLocaleString('en-US') : String(val)
}

export interface StockErrorDetails {
  available: string | null
  required: string | null
  item: string | null
}

export const extractStockDetails = (err: any, rawMsg: string): StockErrorDetails => {
  let available: string | null = null
  let required: string | null = null
  let item: string | null = null

  // 1. Check object fields
  if (err && typeof err === 'object') {
    const src = err.data || err.error || err
    if (src.available_stock !== undefined && src.available_stock !== null) {
      available = formatNumber(src.available_stock)
    } else if (src.available !== undefined && src.available !== null) {
      available = formatNumber(src.available)
    } else if (src.stock !== undefined && src.stock !== null && !src.items) {
      available = formatNumber(src.stock)
    }

    if (src.required_stock !== undefined && src.required_stock !== null) {
      required = formatNumber(src.required_stock)
    } else if (src.required !== undefined && src.required !== null) {
      required = formatNumber(src.required)
    } else if (src.requested !== undefined && src.requested !== null) {
      required = formatNumber(src.requested)
    }

    if (src.product_name || src.item_name || src.product || src.item) {
      item = String(src.product_name || src.item_name || src.product || src.item)
    }
  }

  // 2. Parse from message string if not found
  if (!available) {
    const availMatch =
      rawMsg.match(/(?:available(?:\s+stock)?|stock(?:\s+available)?|in stock|remaining|current stock)[:\s=]+([0-9e\+\.\-]+)/i) ||
      rawMsg.match(/\(available:\s*([0-9e\+\.\-]+)/i) ||
      rawMsg.match(/only\s+([0-9e\+\.\-]+)\s+(?:available|in stock|left|remaining)/i) ||
      rawMsg.match(/([0-9e\+\.\-]+)\s+(?:available|in stock|left|remaining)/i) ||
      rawMsg.match(/(?:คงเหลือ|มีอยู่|เหลือ)(?:\s*ในสต็อก)?[:\s]+([0-9]+)/)
    if (availMatch) available = formatNumber(availMatch[1])
  }

  if (!required) {
    const reqMatch =
      rawMsg.match(/(?:required|requested|needed|demand)(?:\s+quantity|\s+stock|\s+amount)?[:\s=]+([0-9e\+\.\-]+)/i) ||
      rawMsg.match(/\brequired:\s*([0-9e\+\.\-]+)/i) ||
      rawMsg.match(/need\s+([0-9e\+\.\-]+)/i) ||
      rawMsg.match(/(?:จำนวนที่ต้องใช้|ต้องการ)[:\s]+([0-9]+)/)
    if (reqMatch) required = formatNumber(reqMatch[1])
  }

  if (!item) {
    const itemMatch =
      rawMsg.match(/'([^']+)'/) ||
      rawMsg.match(/"([^"]+)"/) ||
      rawMsg.match(/‘([^’]+)’/) ||
      rawMsg.match(/“([^”]+)”/) ||
      rawMsg.match(/(?:item|product|package|bom item)\s+([A-Za-z0-9\s_-]+?)\s+(?:has|is|only)/i)
    if (itemMatch) item = itemMatch[1].trim()
  }

  return { available, required, item }
}

export const formatStockMessage = (details: StockErrorDetails, locale: string): string => {
  const { available, required, item } = details
  const isTh = locale === 'th'

  if (available !== null) {
    if (item && required) {
      return isTh
        ? `คงเหลือในสต็อกสำหรับ '${item}': ${available} ชิ้น (จำนวนที่ต้องใช้: ${required} ชิ้น)`
        : `Available stock for '${item}': ${available} (Required: ${required})`
    } else if (item) {
      return isTh
        ? `คงเหลือในสต็อกสำหรับ '${item}': ${available} ชิ้น`
        : `Available stock for '${item}': ${available}`
    } else if (required) {
      return isTh
        ? `คงเหลือในสต็อก: ${available} ชิ้น (จำนวนที่ต้องใช้: ${required} ชิ้น)`
        : `Available stock: ${available} (Required: ${required})`
    } else {
      return isTh
        ? `คงเหลือในสต็อก: ${available} ชิ้น`
        : `Available stock: ${available}`
    }
  }

  if (item) {
    return isTh
      ? `สินค้าคงคลังไม่เพียงพอสำหรับ '${item}' ในการสั่งซื้อ`
      : `Insufficient stock for '${item}' in this order`
  }

  return isTh
    ? 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ'
    : 'Insufficient stock for product items in this order'
}

/**
 * Pure parser to extract and localize error titles and messages for toasts
 */
export const parseErrorMessage = (
  err: any,
  t: (key: string, values?: any) => string,
  te: (key: string) => boolean,
  locale: string = 'en'
): ParsedToastError => {
  let rawMsg = ''

  if (!err) {
    rawMsg = 'toast.action_failed'
  } else if (typeof err === 'string') {
    rawMsg = err
  } else if (err.message && typeof err.message === 'string') {
    rawMsg = err.message
  } else if (err.error && typeof err.error === 'string') {
    rawMsg = err.error
  } else if (err.error && typeof err.error === 'object') {
    rawMsg = err.error.message || err.error.error || JSON.stringify(err.error)
  } else if (err.data && typeof err.data === 'object') {
    rawMsg = err.data.message || err.data.error || JSON.stringify(err.data)
  } else {
    rawMsg = String(err)
  }

  // Strip common "Error: " prefix from runtime errors
  if (rawMsg.startsWith('Error: ')) {
    rawMsg = rawMsg.slice(7)
  }

  // Check direct key translation
  if (te(rawMsg)) {
    return { title: t('toast.action_failed'), description: t(rawMsg) }
  }

  // Check with common namespaces
  const namespaces = ['toast', 'errors', 'orders', 'customers', 'vendors', 'products', 'categories', 'packages', 'boms']
  for (const ns of namespaces) {
    if (te(`${ns}.${rawMsg}`)) {
      return { title: t('toast.action_failed'), description: t(`${ns}.${rawMsg}`) }
    }
  }

  const lower = rawMsg.toLowerCase().trim()
  const isValidation =
    lower.includes('validation') ||
    lower.includes('required') ||
    lower.includes('invalid') ||
    lower.includes('empty') ||
    lower.includes('stock') ||
    lower.includes('inventory') ||
    lower.includes('insufficient')
  const defaultTitle = isValidation
    ? (te('toast.validation_error') ? t('toast.validation_error') : 'Validation Error')
    : (te('toast.action_failed') ? t('toast.action_failed') : 'Action Failed')

  // Stock availability validation with specific available stock numbers and clear formatting
  const isStockAvailabilityError =
    (lower.includes('stock') ||
     lower.includes('inventory') ||
     (lower.includes('insufficient') && !lower.includes('funds') && !lower.includes('balance')) ||
     (err && typeof err === 'object' && (err.error?.code === 'OUT_OF_STOCK' || err.code === 'OUT_OF_STOCK'))) &&
    !lower.includes('non-negative') &&
    !lower.includes('negative')

  if (isStockAvailabilityError) {
    const details = extractStockDetails(err, rawMsg)
    const stockTitle = te('toast.insufficient_stock')
      ? t('toast.insufficient_stock')
      : (locale === 'th' ? 'สินค้าคงคลังไม่เพียงพอ' : 'Insufficient Stock')
    return {
      title: stockTitle,
      description: formatStockMessage(details, locale)
    }
  }

  // Common dictionary mappings for bilingual backend messages
  const dictTh: Record<string, string> = {
    'failed to create order': 'ไม่สามารถสร้างคำสั่งซื้อได้',
    'failed to update order': 'ไม่สามารถแก้ไขคำสั่งซื้อได้',
    'failed to delete order': 'ไม่สามารถลบคำสั่งซื้อได้',
    'failed to create customer': 'ไม่สามารถสร้างข้อมูลลูกค้าได้',
    'failed to update customer': 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้',
    'failed to delete customer': 'ไม่สามารถลบข้อมูลลูกค้าได้',
    'failed to create vendor': 'ไม่สามารถสร้างข้อมูลผู้ให้บริการได้',
    'failed to update vendor': 'ไม่สามารถแก้ไขข้อมูลผู้ให้บริการได้',
    'failed to create product': 'ไม่สามารถสร้างสินค้าได้',
    'failed to update product': 'ไม่สามารถแก้ไขสินค้าได้',
    'failed to create category': 'ไม่สามารถสร้างหมวดหมู่ได้',
    'failed to update category': 'ไม่สามารถแก้ไขหมวดหมู่ได้',
    'failed to create package': 'ไม่สามารถสร้างแพ็คเกจได้',
    'failed to update package': 'ไม่สามารถแก้ไขแพ็คเกจได้',
    'failed to create bom': 'ไม่สามารถสร้างสูตรการผลิตได้',
    'failed to update bom': 'ไม่สามารถแก้ไขสูตรการผลิตได้',
    'failed to delete bom': 'ไม่สามารถลบสูตรการผลิตได้',
    'failed to load orders': 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้',
    'failed to load customers': 'ไม่สามารถโหลดข้อมูลลูกค้าได้',
    'failed to load vendors': 'ไม่สามารถโหลดข้อมูลผู้ให้บริการได้',
    'failed to load products': 'ไม่สามารถโหลดข้อมูลสินค้าได้',
    'failed to load categories': 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
    'failed to load packages': 'ไม่สามารถโหลดข้อมูลแพ็คเกจได้',
    'failed to load boms': 'ไม่สามารถโหลดข้อมูลสูตรการผลิตได้',
    'failed to load audit logs': 'ไม่สามารถโหลดบันทึกการใช้งานได้',
    'failed to fetch': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
    'invalid credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'email is required': 'กรุณากรอกอีเมล',
    'password is required': 'กรุณากรอกรหัสผ่าน',
    'please fill in all required fields': 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน',
    'customer is required': 'กรุณาเลือกหรือระบุข้อมูลลูกค้า',
    'english name is required': 'กรุณาระบุชื่อภาษาอังกฤษ',
    'thai name is required': 'กรุณาระบุชื่อภาษาไทย',
    'sku identifier is required': 'กรุณาระบุรหัส SKU',
    'product type is required': 'กรุณาเลือกประเภทสินค้า',
    'unit is required': 'กรุณาระบุหน่วยนับ',
    'cost must be a non-negative number': 'ราคาทุนต้องไม่ติดลบ',
    'selling price must be a non-negative number': 'ราคาขายต้องไม่ติดลบ',
    'stock count must be a non-negative number': 'จำนวนสต็อกต้องไม่ติดลบ',
    'reserve stock must be a non-negative number': 'จำนวนสำรองสต็อกต้องไม่ติดลบ',
    'insufficient stock': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'not enough stock': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'out of stock': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'stock is insufficient': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'stock not available': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'exceeds available stock': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'product stock is not enough': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'insufficient inventory': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'stock': 'สินค้าคงคลังไม่เพียงพอสำหรับการสั่งซื้อ',
    'tax id is required': 'กรุณาระบุเลขประจำตัวผู้เสียภาษี',
    'invalid email address format': 'รูปแบบอีเมลไม่ถูกต้อง',
    'vendor type is required': 'กรุณาเลือกประเภทผู้ให้บริการ',
    'price must be a non-negative number': 'ราคาต้องไม่ติดลบ',
    'package must contain at least one product': 'แพ็คเกจต้องประกอบด้วยสินค้าอย่างน้อย 1 รายการ',
    'bom must contain at least one item': 'สูตรการผลิตต้องมีส่วนประกอบอย่างน้อย 1 รายการ',
    'version is required': 'กรุณาระบุเวอร์ชัน',
    'failed to upload document image': 'ไม่สามารถอัปโหลดรูปภาพได้',
    'failed to upload vendor logo image': 'ไม่สามารถอัปโหลดโลโก้ได้',
    'please select a payment channel': 'กรุณาเลือกช่องทางการชำระเงิน',
    'please select or specify customer information': 'กรุณาเลือกหรือระบุข้อมูลลูกค้า',
    'delivery date is required': 'กรุณาระบุวันที่จัดส่ง',
    'order must contain at least one package item': 'คำสั่งซื้อต้องมีรายการแพ็คเกจอย่างน้อย 1 รายการ',
    'quantity must be greater than 0': 'จำนวนต้องมากกว่า 0',
    'session expired. logging out...': 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    'order not found': 'ไม่พบข้อมูลคำสั่งซื้อ',
    'customer not found': 'ไม่พบข้อมูลลูกค้า',
    'unauthorized': 'ไม่มีสิทธิ์เข้าถึงหรือเซสชันหมดอายุ',
    'network error': 'การเชื่อมต่อเครือข่ายขัดข้อง'
  }

  if (locale === 'th') {
    for (const [key, val] of Object.entries(dictTh)) {
      if (lower.includes(key)) {
        return { title: defaultTitle, description: val }
      }
    }
  }

  return {
    title: defaultTitle,
    description: rawMsg
  }
}

/**
 * Deduplication state and utility functions
 */
export interface ToastDedupeRecord {
  key: string
  timestamp: number
}

const errorRecord: ToastDedupeRecord = { key: '', timestamp: 0 }
const successRecord: ToastDedupeRecord = { key: '', timestamp: 0 }

export const shouldDedupeToast = (
  newKey: string,
  record: ToastDedupeRecord,
  windowMs: number = 1500,
  now: number = Date.now()
): boolean => {
  if (newKey && newKey === record.key && (now - record.timestamp) < windowMs) {
    return true
  }
  return false
}

export const resetToastDedupe = () => {
  errorRecord.key = ''
  errorRecord.timestamp = 0
  successRecord.key = ''
  successRecord.timestamp = 0
}

export const useAppToast = () => {
  const toast = useToast()
  const { t, te, locale } = useI18n()

  const showSuccess = (action: 'create' | 'update' | 'delete' | string, resourceName: string) => {
    const dedupeKey = `${action.toLowerCase()}::${resourceName.toLowerCase()}`
    const now = Date.now()

    if (shouldDedupeToast(dedupeKey, successRecord, 1500, now)) {
      return
    }

    successRecord.key = dedupeKey
    successRecord.timestamp = now

    const lowerResource = resourceName.toLowerCase().replace(/[\s-]+/g, '_')
    const translatedResource = te(`toast.${lowerResource}`)
      ? t(`toast.${lowerResource}`)
      : resourceName

    let title = ''
    let description = ''
    let color: 'success' | 'neutral' | 'error' | 'warning' | 'primary' = 'success'
    let icon = ''

    if (action === 'create') {
      title = t('toast.create_title', { resource: translatedResource })
      description = t('toast.create_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-check-circle'
    } else if (action === 'update') {
      title = t('toast.update_title', { resource: translatedResource })
      description = t('toast.update_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-arrow-path'
    } else if (action === 'delete') {
      title = t('toast.delete_title', { resource: translatedResource })
      description = t('toast.delete_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-trash'
    } else {
      title = resourceName
      description = t('toast.create_desc', { resource: translatedResource })
      color = 'success'
      icon = 'i-heroicons-check-circle'
    }

    toast.add({
      title,
      description,
      color,
      icon,
      id: `toast-${action}-${Date.now()}`
    })
  }

  const showError = (err: any, customTitle?: string) => {
    const { title, description } = parseErrorMessage(err, t, te, locale?.value || 'en')
    const finalTitle = customTitle ? (te(customTitle) ? t(customTitle) : customTitle) : title

    const dedupeKey = `${(finalTitle || '').trim().toLowerCase()}::${(description || '').trim().toLowerCase()}`
    const now = Date.now()

    if (shouldDedupeToast(dedupeKey, errorRecord, 1500, now)) {
      return
    }

    errorRecord.key = dedupeKey
    errorRecord.timestamp = now

    toast.add({
      title: finalTitle,
      description,
      color: 'error',
      icon: 'i-heroicons-x-circle',
      id: `toast-error-${Date.now()}`
    })
  }

  return {
    showSuccess,
    showError
  }
}
