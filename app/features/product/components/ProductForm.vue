<template>
  <div class="max-w-5xl mx-auto">
    <UCard class="glass-panel shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
      <template #header>
        <div class="flex items-center justify-between pb-1">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 dark:bg-primary-500/20 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {{ categoryToEdit ? $t('products.edit_title') || 'Edit Product Details' : $t('products.create_title') || 'Register New Product' }}
              </h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ $t('products.form_subtitle_new') || 'Populate inventory specifications and pricing sheets' }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Tab Navigation Menu -->
      <div class="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6 overflow-x-auto scrollbar-thin">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 shrink-0 select-none"
          :class="activeTab === tab.id
            ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- TAB 1: GENERAL INFO -->
        <div v-show="activeTab === 'general'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Fields Grid (Left) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name EN -->
              <UFormGroup
                :label="$t('products.name_en') || 'Product Name (English) *'"
                :error="errors.name_en"
              >
                <UInput
                  v-model="form.name_en"
                  placeholder="e.g. Reagent Kit A"
                  icon="i-heroicons-language"
                  :color="errors.name_en ? 'error' : 'neutral'"
                />
              </UFormGroup>

              <!-- Name TH -->
              <UFormGroup
                :label="$t('products.name_th') || 'Product Name (Thai) *'"
                :error="errors.name_th"
              >
                <UInput
                  v-model="form.name_th"
                  placeholder="เช่น ชุดทดสอบสารเคมี เอ"
                  icon="i-heroicons-language"
                  :color="errors.name_th ? 'error' : 'neutral'"
                />
              </UFormGroup>

              <!-- SKU -->
              <UFormGroup
                :label="$t('products.sku') || 'SKU Identifier *'"
                :error="errors.sku"
              >
                <UInput
                  v-model="form.sku"
                  placeholder="e.g. FB-REA-001"
                  icon="i-heroicons-qr-code"
                  :color="errors.sku ? 'error' : 'neutral'"
                />
              </UFormGroup>

              <!-- Barcode -->
              <UFormGroup
                :label="$t('products.barcode') || 'Barcode'"
              >
                <UInput
                  v-model="form.barcode"
                  placeholder="e.g. 8851234567890"
                  icon="i-heroicons-barcode"
                />
              </UFormGroup>

              <!-- Product Type -->
              <UFormGroup
                :label="$t('products.product_type') || 'Product Type *'"
                :error="errors.product_type"
              >
                <USelectMenu
                  v-model="form.product_type"
                  :options="productTypeOptions"
                  value-attribute="value"
                  option-attribute="label"
                  :color="errors.product_type ? 'error' : 'neutral'"
                />
              </UFormGroup>

              <!-- Category -->
              <UFormGroup
                :label="$t('products.category') || 'Category / Subcategory'"
              >
                <USelectMenu
                  v-model="form.subcategory_id"
                  :options="categoryOptions"
                  value-attribute="value"
                  option-attribute="label"
                />
              </UFormGroup>

              <!-- Unit -->
              <UFormGroup
                :label="$t('products.unit') || 'Inventory Unit *'"
                :error="errors.unit"
              >
                <UInput
                  v-model="form.unit"
                  placeholder="e.g. vials, pcs, boxes"
                  icon="i-heroicons-cube"
                  :color="errors.unit ? 'error' : 'neutral'"
                />
              </UFormGroup>

              <!-- Status Toggle -->
              <div class="flex items-center pt-5">
                <UFormGroup :label="$t('products.is_active') || 'Active Status'">
                  <div class="flex items-center gap-3">
                    <UToggle v-model="form.is_active" color="success" />
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {{ form.is_active ? $t('common.active') || 'Active' : $t('common.inactive') || 'Inactive' }}
                    </span>
                  </div>
                </UFormGroup>
              </div>
            </div>
          </div>

          <!-- Product Image & Desc (Right) -->
          <div class="lg:col-span-1 space-y-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                {{ $t('products.sec_image') || 'Product Image' }}
              </label>

              <!-- Media uploader -->
              <div class="relative w-full aspect-video sm:aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 group flex items-center justify-center p-2 shadow-inner">
                <template v-if="form.image_url">
                  <img :src="form.image_url" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <UButton type="button" color="error" variant="solid" icon="i-heroicons-trash" size="sm" @click="form.image_url = ''">
                      {{ $t('products.remove_image') || 'Remove' }}
                    </UButton>
                  </div>
                </template>
                <template v-else>
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="handleImageUpload"
                  />
                  <div class="text-center space-y-1.5 pointer-events-none">
                    <UIcon name="i-heroicons-photo" class="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                    <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {{ $t('products.upload_image_hint') || 'Upload image' }}
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Description -->
            <UFormGroup :label="$t('products.description') || 'General Description'">
              <UTextarea v-model="form.description" :rows="3" placeholder="Description details..." />
            </UFormGroup>
          </div>
        </div>

        <!-- TAB 2: FINANCIALS & STOCK -->
        <div v-show="activeTab === 'financials'" class="space-y-6">
          <!-- Analytical KPI Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Gross Margin -->
            <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shadow-sm">
              <div class="space-y-0.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ $t('products.profit_margin') || 'Gross Profit Margin' }}</span>
                <h5 class="text-xl font-black" :class="grossMargin >= 30 ? 'text-emerald-500' : grossMargin > 0 ? 'text-amber-500' : 'text-slate-400'">
                  {{ grossMargin > 0 ? `${grossMargin.toFixed(1)}%` : '-' }}
                </h5>
              </div>
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              </div>
            </div>

            <!-- Available Stock -->
            <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shadow-sm">
              <div class="space-y-0.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ $t('products.available_stock') || 'Available Inventory' }}</span>
                <h5 class="text-xl font-black text-indigo-500">
                  {{ availableStock }} <span class="text-xs text-slate-400 font-medium">{{ form.unit || 'pcs' }}</span>
                </h5>
              </div>
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Costing Card -->
            <div class="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
              <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                {{ $t('products.sec_financial_pricing') || 'Cost & Price Structure' }}
              </h5>

              <div class="grid grid-cols-2 gap-4">
                <UFormGroup
                  :label="$t('products.cost') || 'Unit Cost (THB) *'"
                  :error="errors.cost"
                >
                  <UInput
                    v-model.number="form.cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    icon="i-heroicons-banknotes"
                    :color="errors.cost ? 'error' : 'neutral'"
                  />
                </UFormGroup>

                <UFormGroup
                  :label="$t('products.selling_price') || 'Selling Price (THB) *'"
                  :error="errors.selling_price"
                >
                  <UInput
                    v-model.number="form.selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    icon="i-heroicons-tag"
                    :color="errors.selling_price ? 'error' : 'neutral'"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Inventory Quantities Card -->
            <div class="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
              <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                {{ $t('products.sec_financial_stock') || 'Inventory Metrics' }}
              </h5>

              <div class="grid grid-cols-2 gap-4">
                <UFormGroup
                  :label="$t('products.stock') || 'Total Stock *'"
                  :error="errors.stock"
                >
                  <UInput
                    v-model.number="form.stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    icon="i-heroicons-archive-box"
                    :color="errors.stock ? 'error' : 'neutral'"
                  />
                </UFormGroup>

                <UFormGroup
                  :label="$t('products.reserve_stock') || 'Reserve Stock'"
                  :error="errors.reserve_stock"
                >
                  <UInput
                    v-model.number="form.reserve_stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    icon="i-heroicons-lock-closed"
                    :color="errors.reserve_stock ? 'error' : 'neutral'"
                  />
                </UFormGroup>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Storage Condition -->
            <UFormGroup :label="$t('products.storage_condition') || 'Storage Condition'">
              <UInput v-model="form.storage_condition" placeholder="e.g. 2-8°C, -20°C, Room Temp" icon="i-heroicons-sun" />
            </UFormGroup>

            <!-- Lead Time -->
            <UFormGroup :label="$t('products.leadtime') || 'Lead Time'">
              <UInput v-model="form.leadtime" placeholder="e.g. 3 days, 2 weeks" icon="i-heroicons-clock" />
            </UFormGroup>
          </div>
        </div>

        <!-- TAB 3: SPECIFICATIONS & CLINICAL -->
        <div v-show="activeTab === 'specs'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Sample Type Volume -->
            <UFormGroup :label="$t('products.sample_type_volum') || 'Sample Type / Volume'">
              <UInput v-model="form.sample_type_volum" placeholder="e.g. Serum 500uL" icon="i-heroicons-circle-stack" />
            </UFormGroup>

            <!-- Reference Range Unit -->
            <UFormGroup :label="$t('products.reference_range_unit') || 'Reference Range Unit'">
              <UInput v-model="form.reference_range_unit" placeholder="e.g. mg/dL, mmol/L" icon="i-heroicons-variable" />
            </UFormGroup>

            <!-- Method -->
            <UFormGroup :label="$t('products.method') || 'Analytical Method'">
              <UInput v-model="form.method" placeholder="e.g. ELISA, PCR, CLIA" icon="i-heroicons-cpu-chip" />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <!-- Principle -->
            <UFormGroup :label="$t('products.principle') || 'Analytical Principle'">
              <UTextarea v-model="form.principle" :rows="3" placeholder="Describe the chemical or biological principle..." />
            </UFormGroup>

            <!-- Clinical Use -->
            <UFormGroup :label="$t('products.clinical_use') || 'Clinical Use & Application'">
              <UTextarea v-model="form.clinical_use" :rows="3" placeholder="Document the medical or diagnostics clinical use..." />
            </UFormGroup>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Collection Remark -->
              <UFormGroup :label="$t('products.collection_remark') || 'Collection Remark'">
                <UTextarea v-model="form.collection_remark" :rows="3" placeholder="Instructions for collecting samples..." />
              </UFormGroup>

              <!-- Remark -->
              <UFormGroup :label="$t('products.remark') || 'General Remark'">
                <UTextarea v-model="form.remark" :rows="3" placeholder="Additional remarks..." />
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- Action buttons with type="button" to prevent submit event bubbling -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <UButton type="button" color="neutral" variant="ghost" @click="$emit('cancel')">
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
import { reactive, watch, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Product, ProductFormData } from '../types'
import type { Category } from '../../category/types'
import { useImageUpload } from '../../../composables/useImageUpload'
import { useAppToast } from '../../../composables/useAppToast'

const { t, locale } = useI18n()
const { uploadImage } = useImageUpload()
const { showError } = useAppToast()
const isUploadingImage = ref(false)

const props = defineProps<{
  categoryToEdit?: Product | null
  isLoading?: boolean
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', data: ProductFormData): void
  (e: 'cancel'): void
}>()

// Active Tab tracking
const activeTab = ref('general')
const tabs = computed(() => [
  { id: 'general', label: t('products.tab_general') || 'General Info', icon: 'i-heroicons-information-circle' },
  { id: 'financials', label: t('products.tab_financials') || 'Pricing & Inventory', icon: 'i-heroicons-banknotes' },
  { id: 'specs', label: t('products.tab_specs') || 'Specifications / Lab Details', icon: 'i-heroicons-beaker' }
])

const form = reactive({
  name_en: '',
  name_th: '',
  sku: '',
  barcode: '',
  product_type: 'standard',
  subcategory_id: 'root',
  selling_price: 0,
  cost: 0,
  stock: 0,
  reserve_stock: 0,
  unit: 'pcs',
  description: '',
  image_url: '',
  is_active: true,
  remark: '',
  leadtime: '',
  sample_type_volum: '',
  storage_condition: '',
  collection_remark: '',
  principle: '',
  method: '',
  clinical_use: '',
  reference_range_unit: ''
})

const errors = reactive({
  name_en: '',
  name_th: '',
  sku: '',
  product_type: '',
  unit: '',
  selling_price: '',
  cost: '',
  stock: '',
  reserve_stock: ''
})

// Real-time KPI calculations
const grossMargin = computed(() => {
  if (!form.selling_price || form.selling_price <= 0) return 0
  const margin = ((form.selling_price - form.cost) / form.selling_price) * 100
  return isNaN(margin) ? 0 : margin
})

const availableStock = computed(() => {
  return Math.max(0, form.stock - form.reserve_stock)
})

const productTypeOptions = computed(() => [
  { label: t('products.type_standard') || 'Standard Inventory Item', value: 'standard' },
  { label: t('products.type_service') || 'Service Charge / Non-Stock', value: 'service' },
  { label: t('products.type_kit') || 'Kit / Assembly Bundle', value: 'kit' }
])

const categoryOptions = computed(() => {
  const list = props.categories || []
  return [
    { label: t('products.no_category') || 'None (Uncategorized)', value: 'root' },
    ...list.map(c => ({
      label: locale.value === 'th' ? c.name_th : c.name_en,
      value: c.id
    }))
  ]
})

watch(() => props.categoryToEdit, (newVal) => {
  if (newVal) {
    form.name_en = newVal.name_en || ''
    form.name_th = newVal.name_th || ''
    form.sku = newVal.sku || ''
    form.barcode = newVal.barcode || ''
    form.product_type = newVal.product_type || 'standard'
    form.subcategory_id = newVal.subcategory_id || 'root'
    form.selling_price = newVal.selling_price || 0
    form.cost = newVal.cost || 0
    form.stock = newVal.stock || 0
    form.reserve_stock = newVal.reserve_stock || 0
    form.unit = newVal.unit || 'pcs'
    form.description = newVal.description || ''
    form.image_url = newVal.image_url || ''
    form.is_active = newVal.is_active
    form.remark = newVal.remark || ''
    form.leadtime = newVal.leadtime || ''
    form.sample_type_volum = newVal.sample_type_volum || ''
    form.storage_condition = newVal.storage_condition || ''
    form.collection_remark = newVal.collection_remark || ''
    form.principle = newVal.principle || ''
    form.method = newVal.method || ''
    form.clinical_use = newVal.clinical_use || ''
    form.reference_range_unit = newVal.reference_range_unit || ''
  }
}, { immediate: true })

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

const submitForm = async () => {
  let isValid = true

  // Reset errors
  Object.keys(errors).forEach(k => {
    (errors as any)[k] = ''
  })

  if (!form.name_en.trim()) {
    errors.name_en = t('products.err_name_en') || 'English name is required'
    isValid = false
  }

  if (!form.name_th.trim()) {
    errors.name_th = t('products.err_name_th') || 'Thai name is required'
    isValid = false
  }

  if (!form.sku.trim()) {
    errors.sku = t('products.err_sku') || 'SKU identifier is required'
    isValid = false
  }

  if (!form.unit.trim()) {
    errors.unit = t('products.err_unit') || 'Unit is required'
    isValid = false
  }

  if (form.cost === undefined || form.cost === null || isNaN(form.cost) || form.cost < 0) {
    errors.cost = t('products.err_cost') || 'Cost must be a non-negative number'
    isValid = false
  }

  if (form.selling_price === undefined || form.selling_price === null || isNaN(form.selling_price) || form.selling_price < 0) {
    errors.selling_price = t('products.err_price') || 'Selling price must be a non-negative number'
    isValid = false
  }

  if (form.stock === undefined || form.stock === null || isNaN(form.stock) || form.stock < 0) {
    errors.stock = t('products.err_stock') || 'Stock count must be a non-negative number'
    isValid = false
  }

  if (form.reserve_stock === undefined || form.reserve_stock === null || isNaN(form.reserve_stock) || form.reserve_stock < 0) {
    errors.reserve_stock = t('products.err_reserve') || 'Reserve stock must be a non-negative number'
    isValid = false
  }

  if (!isValid) {
    // If there are errors in specific tabs, auto-navigate to the first error tab to show validation indicators
    if (errors.name_en || errors.name_th || errors.sku || errors.unit || errors.product_type) {
      activeTab.value = 'general'
    } else if (errors.cost || errors.selling_price || errors.stock || errors.reserve_stock) {
      activeTab.value = 'financials'
    }
    return
  }

  let uploadedImageUrl = form.image_url

  if (form.image_url && form.image_url.startsWith('data:image/')) {
    isUploadingImage.value = true
    try {
      const url = await uploadImage(form.image_url, 'products')
      if (url) {
        uploadedImageUrl = url
      }
    } catch (err: any) {
      showError(`Failed to upload product image: ${err.message || err}`)
      isUploadingImage.value = false
      return
    } finally {
      isUploadingImage.value = false
    }
  }

  const payload: ProductFormData = {
    name_en: form.name_en,
    name_th: form.name_th,
    sku: form.sku,
    barcode: form.barcode || '',
    product_type: form.product_type,
    subcategory_id: form.subcategory_id === 'root' ? null : (form.subcategory_id || null),
    selling_price: form.selling_price,
    cost: form.cost,
    stock: form.stock,
    reserve_stock: form.reserve_stock,
    unit: form.unit,
    description: form.description || '',
    image_url: uploadedImageUrl || null,
    is_active: form.is_active,
    remark: form.remark || '',
    leadtime: form.leadtime || '',
    sample_type_volum: form.sample_type_volum || '',
    storage_condition: form.storage_condition || '',
    collection_remark: form.collection_remark || '',
    principle: form.principle || '',
    method: form.method || '',
    clinical_use: form.clinical_use || '',
    reference_range_unit: form.reference_range_unit || ''
  }

  emit('save', payload)
}
</script>
