<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-8">
        
        <!-- Section 1: Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-indigo-500" />
            {{ $t('packages.sec_basic') || 'Basic Information' }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name EN -->
            <UFormField :error="errors.name_en || undefined">
              <template #label>
                <span>{{ $t('packages.name_en') || 'Package Name (English)' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_en"
                placeholder="e.g. Premium Gift Bundle"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Name TH -->
            <UFormField :error="errors.name_th || undefined">
              <template #label>
                <span>{{ $t('packages.name_th') || 'Package Name (Thai)' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_th"
                placeholder="เช่น ชุดของขวัญพรีเมียม"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Price -->
            <UFormField :error="errors.price || undefined">
              <template #label>
                <span>{{ $t('packages.price') || 'Price' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model.number="form.price"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                size="md"
                class="w-full font-bold font-mono"
              />
            </UFormField>

            <!-- Description -->
            <UFormField :label="$t('packages.description') || 'Description'">
              <UInput
                v-model="form.description"
                placeholder="Brief description of the package bundle..."
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 2: Package Picture -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-photo" class="w-5 h-5 text-sky-500" />
            {{ $t('packages.sec_image') || 'Package Image' }}
          </h3>
          
          <div class="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleImageUpload"
            />
            <div class="text-center space-y-2 pointer-events-none">
              <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-slate-400 mx-auto" />
              <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {{ $t('packages.upload_image_hint') || 'Drag and drop or click to upload Package image...' }}
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.image_url" class="space-y-2 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UIcon name="i-heroicons-photo" class="w-4 h-4 text-primary-500" />
                {{ $t('packages.uploaded_preview') || 'Image Preview' }}
              </span>
              <UButton color="rose" variant="ghost" icon="i-heroicons-trash" size="xs" @click="form.image_url = ''">
                {{ $t('packages.remove_image') || 'Remove' }}
              </UButton>
            </div>
            <div class="w-40 h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/30">
              <img :src="form.image_url" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Section 3: Package Items -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-squares-plus" class="w-5 h-5 text-emerald-500" />
              {{ $t('packages.sec_items') || 'Package Items' }}
            </h3>
            
            <div class="w-60">
              <!-- Search & Select menu -->
              <USelectMenu
                v-model="selectedProduct"
                v-model:search-term="productSearchQuery"
                :items="productOptions"
                :placeholder="$t('packages.product_placeholder') || 'Type to search products...'"
                size="sm"
                class="w-full"
                label-key="label"
                ignore-filter
                :loading="isSearchingProducts"
              />
            </div>
          </div>

          <!-- Items Empty State -->
          <div v-if="form.items.length === 0" class="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
            <UIcon name="i-heroicons-archive-box-x-mark" class="w-10 h-10 text-slate-400 mx-auto" />
            <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {{ $t('packages.no_items_placeholder') || 'No products added yet. Use the product dropdown search above to add items.' }}
            </p>
          </div>

          <!-- Items Table -->
          <div v-else class="space-y-4">
            <div v-if="errors.items" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200/60 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-rose-500" />
              <span>{{ errors.items }}</span>
            </div>

            <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/30">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    <th class="px-4 py-3 text-left w-1/2">Product (SKU / Name)</th>
                    <th class="px-4 py-3 text-left w-1/4">Quantity</th>
                    <th class="px-4 py-3 text-left w-1/6">Unit</th>
                    <th class="px-4 py-3 text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-for="(item, index) in form.items" :key="item.product_id">
                    <td class="px-4 py-3">
                      <div class="flex flex-col">
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">{{ item.product_sku || '-' }}</span>
                        <span class="text-sm font-bold text-slate-900 dark:text-white">
                          {{ locale === 'th' ? item.product_name_th : item.product_name_en }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <UInput
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        size="xs"
                        class="w-24 font-bold font-mono"
                      />
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {{ item.product_unit || 'pcs' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <UButton
                        type="button"
                        color="error"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
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
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <UButton type="button" color="gray" variant="ghost" @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton type="submit" color="primary" class="px-6 font-semibold" :loading="isLoading || isUploadingImage">
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
import type { Package, PackageFormData } from '../types'
import type { Product } from '../../product/types'
import { useApiFetch } from '../../../composables/useApiFetch'
import { useImageUpload } from '../../../composables/useImageUpload'
import { useAppToast } from '../../../composables/useAppToast'

const { t, locale } = useI18n()
const { apiFetch } = useApiFetch()
const { uploadImage } = useImageUpload()
const { showError } = useAppToast()

const props = defineProps<{
  packageToEdit?: Package | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: PackageFormData): void
  (e: 'cancel'): void
}>()

const isUploadingImage = ref(false)

// Form structure
const form = reactive({
  name_en: '',
  name_th: '',
  description: '',
  image_url: '',
  price: 0,
  items: [] as Array<{
    product_id: string
    quantity: number
    product_name_en: string
    product_name_th: string
    product_sku: string
    product_unit: string
  }>
})

// Validation errors
const errors = reactive({
  name_en: '',
  name_th: '',
  price: '',
  items: ''
})

// Search states
const selectedProduct = ref<any>(null)
const productSearchQuery = ref('')
const productOptions = ref<any[]>([])
const isSearchingProducts = ref(false)

// Watch search input to execute dynamic API queries
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
          unit: p.unit || 'pcs'
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

// Simple debounce helper
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

watch(productSearchQuery, (newVal) => {
  debouncedFetchProductOptions(newVal)
})

// Add chosen product to package list
watch(selectedProduct, (val) => {
  if (val) {
    const exists = form.items.find(item => item.product_id === val.id)
    if (exists) {
      exists.quantity += 1
    } else {
      form.items.push({
        product_id: val.id,
        quantity: 1,
        product_name_en: val.name_en,
        product_name_th: val.name_th,
        product_sku: val.sku,
        product_unit: val.unit || 'pcs'
      })
    }
    selectedProduct.value = null
  }
})

// Load package data when editing
watch(() => props.packageToEdit, async (newVal) => {
  if (newVal) {
    form.name_en = newVal.name_en || ''
    form.name_th = newVal.name_th || ''
    form.description = newVal.description || ''
    form.image_url = newVal.image_url || ''
    form.price = newVal.price || 0
    
    if (newVal.items && Array.isArray(newVal.items)) {
      form.items = await Promise.all(
        newVal.items.map(async (item: any) => {
          let product_name_en = item.product?.name_en || item.product_name_en || ''
          let product_name_th = item.product?.name_th || item.product_name_th || ''
          let product_sku = item.product?.sku || item.product_sku || ''
          let product_unit = item.product?.unit || item.product_unit || 'pcs'

          if (!product_name_en && !product_name_th && item.product_id) {
            try {
              const res = await apiFetch(`/api/v1/products/${item.product_id}`)
              if (res.ok) {
                const json = await res.json()
                if (json.success && json.data) {
                  const p = json.data
                  product_name_en = p.name_en
                  product_name_th = p.name_th
                  product_sku = p.sku
                  product_unit = p.unit || 'pcs'
                }
              }
            } catch (e) {
              console.error('Error fetching product for edit package:', e)
            }
          }

          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product_name_en,
            product_name_th,
            product_sku,
            product_unit
          }
        })
      )
    } else {
      form.items = []
    }
  } else {
    // Clean states in Add mode
    form.name_en = ''
    form.name_th = ''
    form.description = ''
    form.image_url = ''
    form.price = 0
    form.items = []
  }
}, { immediate: true })

// Search initial products on mount
if (import.meta.client) {
  fetchProductOptions('')
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      form.image_url = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
}

const submitForm = async () => {
  let isValid = true

  errors.name_en = ''
  errors.name_th = ''
  errors.price = ''
  errors.items = ''

  if (!form.name_en.trim()) {
    errors.name_en = t('packages.err_name_en_required') || 'English package name is required'
    isValid = false
  }

  if (!form.name_th.trim()) {
    errors.name_th = t('packages.err_name_th_required') || 'Thai package name is required'
    isValid = false
  }

  if (form.price === undefined || form.price === null || isNaN(form.price) || form.price < 0) {
    errors.price = t('packages.err_price_invalid') || 'Price must be a non-negative number'
    isValid = false
  }

  if (form.items.length === 0) {
    errors.items = t('packages.err_items_empty') || 'Package must contain at least one product'
    isValid = false
  } else {
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity <= 0) {
        errors.items = `${t('packages.err_quantity_invalid') || 'Quantity must be greater than zero'} (Row ${i + 1})`
        isValid = false
        break
      }
    }
  }

  if (!isValid) return

  let uploadedImageUrl = form.image_url
  if (form.image_url && form.image_url.startsWith('data:image/')) {
    isUploadingImage.value = true
    try {
      const url = await uploadImage(form.image_url, 'packages')
      if (url) {
        uploadedImageUrl = url
      }
    } catch (err: any) {
      showError(`Failed to upload document image: ${err.message || err}`)
      isUploadingImage.value = false
      return
    } finally {
      isUploadingImage.value = false
    }
  }

  const payload: PackageFormData = {
    name_en: form.name_en,
    name_th: form.name_th,
    description: form.description,
    image_url: uploadedImageUrl,
    price: form.price,
    items: form.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
  }

  emit('save', payload)
}
</script>
