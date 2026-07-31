import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'

export const useDomainLabels = () => {
  const { t, te } = useI18n()
  const { isLab } = useAuthEngine()

  /**
   * Domain label resolver: Resolves `tests.<key>` if company type is `lab`
   * and key exists, falling back to `products.<key>` or provided fallback.
   */
  const dl = (key: string, fallback?: string): string => {
    if (isLab.value) {
      const testKey = `tests.${key}`
      if (te(testKey)) {
        return t(testKey)
      }
    }
    const productKey = `products.${key}`
    if (te(productKey)) {
      return t(productKey)
    }
    return fallback || key
  }

  const title = computed(() => dl('title', isLab.value ? 'Tests Master' : 'Products Master'))
  const subtitle = computed(() => dl('subtitle', isLab.value ? 'Manage laboratory tests, analytical methods, and clinical specifications' : 'Create, update, and monitor product inventories and parameters'))
  const addLabel = computed(() => dl('add_product', isLab.value ? 'Add Test' : 'Add Product'))
  const nameEnLabel = computed(() => dl('name_en', isLab.value ? 'Test Name (English)' : 'Product Name (English)'))
  const nameThLabel = computed(() => dl('name_th', isLab.value ? 'Test Name (Thai)' : 'Product Name (Thai)'))
  const skuLabel = computed(() => dl('sku', isLab.value ? 'Test Code / Identifier' : 'SKU Identifier'))
  const typeLabel = computed(() => dl('product_type', isLab.value ? 'Test Type' : 'Product Type'))
  const colName = computed(() => dl('col_name', isLab.value ? 'Test Name' : 'Product Name'))
  const searchPlaceholder = computed(() => dl('search_placeholder', isLab.value ? 'Search tests by name or code...' : 'Search products by name or SKU...'))
  const confirmDeleteTitle = computed(() => dl('confirm_delete_title', isLab.value ? 'Confirm Test Deletion' : 'Confirm Product Deletion'))
  const confirmDeleteDesc = computed(() => dl('confirm_delete_desc', isLab.value ? 'Are you sure you want to permanently delete this test?' : 'Are you sure you want to permanently delete this product?'))
  const itemLabel = computed(() => isLab.value ? (t('orders.col_tests') || 'Tests') : (t('orders.col_items') || 'Items'))

  return {
    isLab,
    dl,
    title,
    subtitle,
    addLabel,
    nameEnLabel,
    nameThLabel,
    skuLabel,
    typeLabel,
    colName,
    searchPlaceholder,
    confirmDeleteTitle,
    confirmDeleteDesc,
    itemLabel
  }
}
