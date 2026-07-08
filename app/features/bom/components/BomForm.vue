<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-8">

        <!-- Section 1: Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-highlighted pb-2 border-b border-muted flex items-center gap-2">
            <UIcon name="i-heroicons-cog-8-tooth" class="w-5 h-5 text-indigo-500" />
            {{ $t('boms.sec_basic') || 'Basic Identification' }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- BOM Name -->
            <UFormField :error="errors.bom_name || undefined">
              <template #label>
                <span>{{ $t('boms.bom_name') || 'BOM Name' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.bom_name"
                placeholder="e.g. Standard Assembly Formula"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Product Dropdown (Server-side Searchable) -->
            <UFormField :error="errors.product_id || undefined">
              <template #label>
                <span>{{ $t('boms.product') || 'Associated Product' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <USelectMenu
                v-model="form.product_id"
                v-model:search-term="productSearchQuery"
                :items="productOptions"
                :placeholder="$t('boms.product_placeholder') || 'Type to search products...'"
                size="md"
                class="w-full"
                value-key="id"
                label-key="label"
                ignore-filter
                :loading="isSearchingProducts"
              />
            </UFormField>

            <!-- Version -->
            <UFormField :error="errors.version || undefined">
              <template #label>
                <span>{{ $t('boms.version') || 'Version' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model.number="form.version"
                type="number"
                min="1"
                placeholder="1"
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 2: Component Items -->
        <div class="space-y-4 pt-4 border-t border-muted">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-muted">
            <h3 class="text-sm font-bold text-highlighted flex items-center gap-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5 text-emerald-500" />
              {{ $t('boms.sec_items') || 'Component Items / Composition' }}
            </h3>
            
            <div class="flex items-center gap-3">
              <!-- Search & Quick Add from Products -->
              <div class="w-60">
                <USelectMenu
                  v-model="quickAddProduct"
                  v-model:search-term="quickAddSearchQuery"
                  :items="quickAddOptions"
                  :placeholder="'Quick add component...'"
                  size="xs"
                  class="w-full"
                  value-key="id"
                  label-key="label"
                  ignore-filter
                  :loading="isSearchingQuickAdd"
                />
              </div>

              <!-- Manual Add Button -->
              <UButton
                type="button"
                color="neutral"
                variant="subtle"
                icon="i-heroicons-plus"
                size="sm"
                class="font-semibold"
                @click="addBlankItem"
              >
                Add Row
              </UButton>
            </div>
          </div>

          <!-- Items Empty State -->
          <div v-if="form.items.length === 0" class="p-8 border border-dashed border-muted rounded-2xl text-center space-y-2">
            <UIcon name="i-heroicons-archive-box-x-mark" class="w-10 h-10 text-dimmed mx-auto" />
            <p class="text-xs text-muted font-semibold">
              {{ $t('boms.err_items_empty') || 'No components added yet. Use the Quick Add or Add Row buttons above.' }}
            </p>
          </div>

          <!-- Items Table/List -->
          <div v-else class="space-y-4">
            <div v-if="errors.items" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200/60 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-rose-500" />
              <span>{{ errors.items }}</span>
            </div>

            <div class="overflow-x-auto border border-muted rounded-xl">
              <table class="min-w-full divide-y divide-muted bg-white dark:bg-slate-900/30">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-dimmed">
                    <th class="px-4 py-3 text-left w-1/3">
                      <span>Component Name (TH / EN)</span>
                      <span class="text-error font-bold ml-0.5">*</span>
                    </th>
                    <th class="px-4 py-3 text-left w-1/12">
                      <span>Qty</span>
                      <span class="text-error font-bold ml-0.5">*</span>
                    </th>
                    <th class="px-4 py-3 text-left w-1/12">
                      <span>Unit</span>
                      <span class="text-error font-bold ml-0.5">*</span>
                    </th>
                    <th class="px-4 py-3 text-left w-1/12">Stock</th>
                    <th class="px-4 py-3 text-left w-1/12">Reserved</th>
                    <th class="px-4 py-3 text-left w-1/4">Remark</th>
                    <th class="px-4 py-3 text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-muted">
                  <tr v-for="(item, index) in form.items" :key="index">
                    <!-- Names -->
                    <td class="px-3 py-3 space-y-1.5">
                      <UInput
                        v-model="item.name_th"
                        placeholder="ชื่อภาษาไทย (Thai Name)"
                        size="xs"
                        class="w-full font-medium"
                      />
                      <UInput
                        v-model="item.name_en"
                        placeholder="ชื่อภาษาอังกฤษ (English Name)"
                        size="xs"
                        class="w-full font-medium"
                      />
                    </td>
                    <!-- Quantity -->
                    <td class="px-3 py-3 align-top">
                      <UInput
                        v-model.number="item.quantity"
                        type="number"
                        min="0.001"
                        step="any"
                        placeholder="0"
                        size="xs"
                        class="w-full font-bold font-mono"
                      />
                    </td>
                    <!-- Unit -->
                    <td class="px-3 py-3 align-top">
                      <UInput
                        v-model="item.unit"
                        placeholder="pcs"
                        size="xs"
                        class="w-full font-medium"
                      />
                    </td>
                    <!-- Stock -->
                    <td class="px-3 py-3 align-top">
                      <UInput
                        v-model.number="item.stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        size="xs"
                        class="w-full font-mono text-slate-500"
                      />
                    </td>
                    <!-- Reserve Stock -->
                    <td class="px-3 py-3 align-top">
                      <UInput
                        v-model.number="item.reserve_stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        size="xs"
                        class="w-full font-mono text-slate-500"
                      />
                    </td>
                    <!-- Remark -->
                    <td class="px-3 py-3 align-top">
                      <UInput
                        v-model="item.remark"
                        placeholder="e.g. Raw material batch A"
                        size="xs"
                        class="w-full"
                      />
                    </td>
                    <!-- Delete Button -->
                    <td class="px-3 py-3 text-center align-top">
                      <UButton
                        type="button"
                        color="error"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        class="mt-1"
                        @click="removeItem(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-muted">
          <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton type="submit" color="primary" class="px-6 font-semibold" icon="i-heroicons-check" :loading="isLoading">
            {{ $t('common.save') }}
          </UButton>
        </div>

      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Bom, BomFormData, BomItem } from '../types'
import type { Product } from '../../product/types'
import { useApiFetch } from '../../../composables/useApiFetch'

const { t, locale } = useI18n()
const { apiFetch } = useApiFetch()

const props = defineProps<{
  categoryToEdit?: Bom | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: BomFormData): void
  (e: 'cancel'): void
}>()

// Main form state
const form = reactive({
  bom_name: '',
  product_id: '',
  version: 1,
  items: [] as BomItem[]
})

// Validation errors state
const errors = reactive({
  bom_name: '',
  product_id: '',
  version: '',
  items: ''
})

// Dropdown support states
const quickAddProduct = ref<any>(null)

const productSearchQuery = ref('')
const productOptions = ref<any[]>([])
const isSearchingProducts = ref(false)

const quickAddSearchQuery = ref('')
const quickAddOptions = ref<any[]>([])
const isSearchingQuickAdd = ref(false)

// Listen to quick add product selection to append component items
watch(quickAddProduct, (val) => {
  if (val) {
    // Check if component already added to avoid duplicates (optional but good practice)
    const exists = form.items.some(item => item.name_en === val.name_en && item.name_th === val.name_th)
    if (!exists) {
      form.items.push({
        name_en: val.name_en || '',
        name_th: val.name_th || '',
        quantity: 1,
        remark: '',
        reserve_stock: val.reserve_stock || 0,
        stock: val.stock || 0,
        unit: val.unit || 'pcs'
      })
    }
    // Reset quick add selector
    quickAddProduct.value = null
  }
})

// Server side product fetch for USelectMenu search
const fetchProductOptions = async (query: string) => {
  isSearchingProducts.value = true
  try {
    const res = await apiFetch(`/api/v1/products?search=${encodeURIComponent(query)}&page=1&limit=5`)
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        productOptions.value = json.data.map((p: Product) => ({
          id: p.id,
          label: locale.value === 'th' ? `${p.name_th} (${p.sku})` : `${p.name_en} (${p.sku})`,
          name_en: p.name_en,
          name_th: p.name_th,
          sku: p.sku,
          unit: p.unit || 'pcs',
          stock: p.stock || 0,
          reserve_stock: p.reserve_stock || 0
        }))
      } else {
        productOptions.value = []
      }
    } else {
      productOptions.value = []
    }
  } catch (err) {
    console.error('Error fetching product options:', err)
    productOptions.value = []
  } finally {
    isSearchingProducts.value = false
  }
}

const fetchQuickAddOptions = async (query: string) => {
  isSearchingQuickAdd.value = true
  try {
    const res = await apiFetch(`/api/v1/products?search=${encodeURIComponent(query)}&page=1&limit=5`)
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        quickAddOptions.value = json.data.map((p: Product) => ({
          id: p.id,
          label: locale.value === 'th' ? `${p.name_th} (${p.sku})` : `${p.name_en} (${p.sku})`,
          name_en: p.name_en,
          name_th: p.name_th,
          sku: p.sku,
          unit: p.unit || 'pcs',
          stock: p.stock || 0,
          reserve_stock: p.reserve_stock || 0
        }))
      } else {
        quickAddOptions.value = []
      }
    } else {
      quickAddOptions.value = []
    }
  } catch (err) {
    console.error('Error fetching quick add options:', err)
    quickAddOptions.value = []
  } finally {
    isSearchingQuickAdd.value = false
  }
}

// Debounce helper function
function debounce(fn: Function, delay = 300) {
  let timeoutId: any
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const debouncedFetchProductOptions = debounce((query: string) => {
  fetchProductOptions(query)
}, 300)

const debouncedFetchQuickAddOptions = debounce((query: string) => {
  fetchQuickAddOptions(query)
}, 300)

// Watch search queries (no immediate: true to avoid calling API twice on mount!)
watch(productSearchQuery, (newVal) => {
  debouncedFetchProductOptions(newVal)
})

watch(quickAddSearchQuery, (newVal) => {
  debouncedFetchQuickAddOptions(newVal)
})

// Watch categoryToEdit to populate form on edit page
watch(() => props.categoryToEdit, async (newVal) => {
  if (newVal) {
    form.bom_name = newVal.bom_name || ''
    form.product_id = newVal.product_id || ''
    form.version = newVal.version || 1
    form.items = newVal.items ? JSON.parse(JSON.stringify(newVal.items)) : []

    // Fetch product details explicitly from /api/v1/products/{id} for the dropdown
    if (newVal.product_id) {
      try {
        const res = await apiFetch(`/api/v1/products/${newVal.product_id}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            const p = json.data
            const prodOption = {
              id: p.id,
              label: locale.value === 'th' ? `${p.name_th} (${p.sku})` : `${p.name_en} (${p.sku})`,
              name_en: p.name_en,
              name_th: p.name_th,
              sku: p.sku,
              unit: p.unit || 'pcs',
              stock: p.stock || 0,
              reserve_stock: p.reserve_stock || 0
            }
            productOptions.value = [prodOption]
          }
        }
      } catch (err) {
        console.error('Error fetching edit product details:', err)
      }
    }
  } else {
    // Add mode: fetch initial options only once on mount
    fetchProductOptions('')
  }
}, { immediate: true })

const addBlankItem = () => {
  form.items.push({
    name_en: '',
    name_th: '',
    quantity: 1,
    remark: '',
    reserve_stock: 0,
    stock: 0,
    unit: 'pcs'
  })
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
}

const submitForm = () => {
  let isValid = true

  // Reset errors
  errors.bom_name = ''
  errors.product_id = ''
  errors.version = ''
  errors.items = ''

  // Validate Basic Info
  if (!form.bom_name.trim()) {
    errors.bom_name = t('boms.err_name') || 'BOM Name is required'
    isValid = false
  }

  if (!form.product_id) {
    errors.product_id = t('boms.err_product') || 'Product selection is required'
    isValid = false
  }

  if (form.version === undefined || form.version === null || isNaN(form.version) || form.version < 1) {
    errors.version = t('boms.err_version') || 'Version is required and must be at least 1'
    isValid = false
  }

  // Validate Items
  if (form.items.length === 0) {
    errors.items = t('boms.err_items_empty') || 'BOM must contain at least one item'
    isValid = false
  } else {
    // Check all item properties
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      if (!item.name_th.trim()) {
        errors.items = `${t('boms.err_item_name_th') || 'Component Thai name is required'} (Row ${i + 1})`
        isValid = false
        break
      }
      if (!item.name_en.trim()) {
        errors.items = `${t('boms.err_item_name_en') || 'Component English name is required'} (Row ${i + 1})`
        isValid = false
        break
      }
      if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity <= 0) {
        errors.items = `${t('boms.err_item_quantity') || 'Quantity must be greater than zero'} (Row ${i + 1})`
        isValid = false
        break
      }
      if (!item.unit.trim()) {
        errors.items = `${t('boms.err_item_unit') || 'Unit is required'} (Row ${i + 1})`
        isValid = false
        break
      }

      // Default stock/reserve stock if empty
      if (item.stock === undefined || item.stock === null || isNaN(item.stock)) {
        item.stock = 0
      }
      if (item.reserve_stock === undefined || item.reserve_stock === null || isNaN(item.reserve_stock)) {
        item.reserve_stock = 0
      }
    }
  }

  if (!isValid) return

  const payload: BomFormData = {
    bom_name: form.bom_name,
    product_id: form.product_id,
    version: form.version,
    items: form.items
  }

  emit('save', payload)
}
</script>
