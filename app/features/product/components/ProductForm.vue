<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-6">

        <!-- Section 1: Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-highlighted pb-2 border-b border-muted">
            {{ $t('products.sec_general') || 'Basic Information' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :error="errors.name_en || undefined">
              <template #label>
                <span>{{ $t('products.name_en') || 'Product Name (English)' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_en"
                placeholder="e.g. Reagent Kit A"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.name_th || undefined">
              <template #label>
                <span>{{ $t('products.name_th') || 'Product Name (Thai)' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_th"
                placeholder="เช่น ชุดทดสอบสารเคมี เอ"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.sku || undefined">
              <template #label>
                <span>{{ $t('products.sku') || 'SKU Identifier' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.sku"
                placeholder="e.g. FB-REA-001"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('products.barcode') || 'Barcode'">
              <UInput
                v-model="form.barcode"
                placeholder="e.g. 8851234567890"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.product_type || undefined">
              <template #label>
                <span>{{ $t('products.product_type') || 'Product Type' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <USelectMenu
                v-model="form.product_type"
                :items="productTypeOptions"
                value-key="value"
                label-key="label"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('products.category') || 'Category / Subcategory'">
              <USelectMenu
                v-model="form.subcategory_id"
                :items="categoryOptions"
                value-key="value"
                label-key="label"
                searchable
                size="md"
                class="w-full"
                :placeholder="$t('products.no_category') || 'Select Category'"
              />
            </UFormField>

            <UFormField :error="errors.unit || undefined">
              <template #label>
                <span>{{ $t('products.unit') || 'Inventory Unit' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.unit"
                placeholder="e.g. vials, pcs, boxes"
                size="md"
                class="w-full"
              />
            </UFormField>

            <div class="flex items-center gap-3 pt-2">
              <label class="text-sm font-semibold text-toned">
                {{ $t('products.is_active') || 'Active Status' }}
              </label>
              <USwitch v-model="form.is_active" color="primary" />
            </div>
          </div>
        </div>

        <!-- Section 2: Product Image -->
        <div class="space-y-4 pt-4 border-t border-muted">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('products.sec_image') || 'Product Image' }}
          </h3>

          <div class="flex items-center justify-center border-2 border-dashed border-muted rounded-xl p-6 hover:bg-muted transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleImageUpload"
            />
            <div class="text-center space-y-2 pointer-events-none">
              <UIcon name="i-lucide-upload" class="w-8 h-8 text-dimmed mx-auto" />
              <div class="text-xs font-semibold text-muted">
                {{ $t('products.upload_image_hint') || 'Drag and drop or click to upload product image...' }}
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.image_url" class="space-y-2 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-toned flex items-center gap-1.5">
                <UIcon name="i-lucide-image" class="w-4 h-4 text-primary" />
                {{ $t('products.uploaded_preview') || 'Image Preview' }}
              </span>
              <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs" @click="form.image_url = ''">
                {{ $t('products.remove_image') || 'Remove' }}
              </UButton>
            </div>
            <div class="w-40 h-40 rounded-xl overflow-hidden border border-muted shadow-sm bg-muted">
              <img :src="form.image_url" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Section 3: Description -->
        <div class="space-y-4 pt-4 border-t border-muted">
          <h3 class="text-sm font-bold text-highlighted pb-2 border-b border-muted">
            {{ $t('products.description') || 'General Description' }}
          </h3>
          <UFormField>
            <UTextarea v-model="form.description" :rows="3" autoresize :maxrows="6" placeholder="Product description details..." class="w-full" />
          </UFormField>
        </div>

        <!-- Section 4: Pricing & Inventory -->
        <div class="space-y-4 pt-4 border-t border-muted">
          <h3 class="text-sm font-bold text-highlighted pb-2 border-b border-muted">
            {{ $t('products.sec_financial_pricing') || 'Pricing & Inventory' }}
          </h3>

          <!-- KPI Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-muted bg-muted flex items-center justify-between">
              <div class="space-y-0.5">
                <span class="text-[10px] text-dimmed font-bold uppercase tracking-wider">{{ $t('products.profit_margin') || 'Gross Profit Margin' }}</span>
                <h5 class="text-xl font-black" :class="grossMargin >= 30 ? 'text-success' : grossMargin > 0 ? 'text-warning' : 'text-dimmed'">
                  {{ grossMargin > 0 ? `${grossMargin.toFixed(1)}%` : '-' }}
                </h5>
              </div>
              <div class="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <UIcon name="i-lucide-trending-up" class="w-5 h-5" />
              </div>
            </div>

            <div class="p-4 rounded-xl border border-muted bg-muted flex items-center justify-between">
              <div class="space-y-0.5">
                <span class="text-[10px] text-dimmed font-bold uppercase tracking-wider">{{ $t('products.available_stock') || 'Available Inventory' }}</span>
                <h5 class="text-xl font-black text-info">
                  {{ availableStock }} <span class="text-xs text-dimmed font-medium">{{ form.unit || 'pcs' }}</span>
                </h5>
              </div>
              <div class="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <UIcon name="i-lucide-package-check" class="w-5 h-5" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :error="errors.cost || undefined">
              <template #label>
                <span>{{ $t('products.cost') || 'Unit Cost (THB)' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model.number="form.cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.selling_price || undefined">
              <template #label>
                <span>{{ $t('products.selling_price') || 'Selling Price (THB)' }}</span>
                <span class="text-error font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model.number="form.selling_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.stock || undefined" :label="$t('products.stock') || 'Total Stock'">
              <UInput
                v-model.number="form.stock"
                type="number"
                min="0"
                placeholder="0"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.reserve_stock || undefined" :label="$t('products.reserve_stock') || 'Reserve Stock'">
              <UInput
                v-model.number="form.reserve_stock"
                type="number"
                min="0"
                placeholder="0"
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="$t('products.storage_condition') || 'Storage Condition'">
              <UInput v-model="form.storage_condition" placeholder="e.g. 2-8°C, -20°C, Room Temp" size="md" class="w-full" />
            </UFormField>

            <UFormField :label="$t('products.leadtime') || 'Lead Time'">
              <UInput v-model="form.leadtime" placeholder="e.g. 3 days, 2 weeks" size="md" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Section 5: Specifications / Lab Details -->
        <div class="space-y-4 pt-4 border-t border-muted">
          <h3 class="text-sm font-bold text-highlighted pb-2 border-b border-muted">
            {{ $t('products.sec_specs') || 'Specifications / Lab Details' }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField :label="$t('products.sample_type_volum') || 'Sample Type / Volume'">
              <UInput v-model="form.sample_type_volum" placeholder="e.g. Serum 500uL" size="md" class="w-full" />
            </UFormField>

            <UFormField :label="$t('products.reference_range_unit') || 'Reference Range Unit'">
              <UInput v-model="form.reference_range_unit" placeholder="e.g. mg/dL, mmol/L" size="md" class="w-full" />
            </UFormField>

            <UFormField :label="$t('products.method') || 'Analytical Method'">
              <UInput v-model="form.method" placeholder="e.g. ELISA, PCR, CLIA" size="md" class="w-full" />
            </UFormField>
          </div>

          <UFormField :label="$t('products.principle') || 'Analytical Principle'">
            <UTextarea v-model="form.principle" :rows="3" autoresize :maxrows="6" placeholder="Describe the chemical or biological principle..." class="w-full" />
          </UFormField>

          <UFormField :label="$t('products.clinical_use') || 'Clinical Use & Application'">
            <UTextarea v-model="form.clinical_use" :rows="3" autoresize :maxrows="6" placeholder="Document the medical or diagnostics clinical use..." class="w-full" />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="$t('products.collection_remark') || 'Collection Remark'">
              <UTextarea v-model="form.collection_remark" :rows="3" autoresize :maxrows="6" placeholder="Instructions for collecting samples..." class="w-full" />
            </UFormField>

            <UFormField :label="$t('products.remark') || 'General Remark'">
              <UTextarea v-model="form.remark" :rows="3" autoresize :maxrows="6" placeholder="Additional remarks..." class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-muted">
          <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton type="submit" color="primary" class="px-6 font-semibold" icon="i-heroicons-check" :loading="isLoading || isUploadingImage">
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

  if (!form.product_type) {
    errors.product_type = t('products.err_product_type') || 'Product type is required'
    isValid = false
  }

  if (!form.unit.trim()) {
    errors.unit = t('products.err_unit') || 'Unit is required'
    isValid = false
  }

  if (form.cost === undefined || form.cost === null || isNaN(form.cost) || (form.cost as any) === '') {
    errors.cost = t('products.err_cost_required') || 'Cost is required'
    isValid = false
  } else if (form.cost < 0) {
    errors.cost = t('products.err_cost') || 'Cost must be a non-negative number'
    isValid = false
  }

  if (form.selling_price === undefined || form.selling_price === null || isNaN(form.selling_price) || (form.selling_price as any) === '') {
    errors.selling_price = t('products.err_price_required') || 'Selling price is required'
    isValid = false
  } else if (form.selling_price < 0) {
    errors.selling_price = t('products.err_price') || 'Selling price must be a non-negative number'
    isValid = false
  }

  if (form.stock === undefined || form.stock === null || isNaN(form.stock) || (form.stock as any) === '') {
    form.stock = 0
  } else if (form.stock < 0) {
    errors.stock = t('products.err_stock') || 'Stock count must be a non-negative number'
    isValid = false
  }

  if (form.reserve_stock === undefined || form.reserve_stock === null || isNaN(form.reserve_stock) || form.reserve_stock < 0) {
    errors.reserve_stock = t('products.err_reserve') || 'Reserve stock must be a non-negative number'
    isValid = false
  }

  if (!isValid) return

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
