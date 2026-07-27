<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- Section 1: Vendor Type & Tax ID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <UFormField :error="errors.type || undefined">
            <template #label>
              <span>{{ $t('vendors.vendor_type') }}</span>
              <span class="text-red-500 font-bold ml-0.5">*</span>
            </template>
            <USelectMenu
              v-model="form.type"
              :items="typeOptions"
              value-key="value"
              label-key="label"
              size="md"
              class="w-full"
              :placeholder="$t('vendors.select_type')"
            />
          </UFormField>

          <UFormField :label="$t('vendors.tax_id')" :error="errors.tax_id || undefined">
            <template #label v-if="form.type === 'company'">
              <span>{{ $t('vendors.tax_id') }}</span>
              <span class="text-red-500 font-bold ml-0.5">*</span>
            </template>
            <UInput
              v-model="form.tax_id"
              placeholder="0105560012345"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Section 2: Vendor Name (EN & TH) -->
        <div class="space-y-4 pt-2">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('vendors.name_heading') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :error="errors.name_en || undefined">
              <template #label>
                <span>{{ $t('vendors.name_en') }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_en"
                placeholder="Siam Industrial Polymers Co., Ltd."
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.name_th || undefined">
              <template #label>
                <span>{{ $t('vendors.name_th') }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_th"
                placeholder="บริษัท สยามอินดัสเทรียล พอลิเมอร์ จำกัด"
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 3: Contact Person & Details -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('vendors.contact_heading') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField :label="$t('vendors.contact_name')" :error="errors.contact_name || undefined">
              <UInput
                v-model="form.contact_name"
                placeholder="Somchai Prasert"
                size="md"
                icon="i-heroicons-user"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('vendors.phone')" :error="errors.phone || undefined">
              <UInput
                v-model="form.phone"
                placeholder="+66812345678"
                size="md"
                icon="i-heroicons-phone"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('vendors.email')" :error="errors.email || undefined">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="vendor@siampolymer.co.th"
                size="md"
                icon="i-heroicons-envelope"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 4: Address Detail (EN & TH) -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('vendors.address_heading') }}</h3>

          <div class="space-y-4">
            <UFormField :label="$t('vendors.address_en')" class="w-full">
              <UTextarea v-model="form.address_en" placeholder="123 Industrial Estate Zone A, Rayong 21150..." size="md" rows="2" class="w-full" />
            </UFormField>
            <UFormField :label="$t('vendors.address_th')" class="w-full">
              <UTextarea v-model="form.address_th" placeholder="123 นิคมอุตสาหกรรม โซนเอ ระยอง 21150..." size="md" rows="2" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Section 5: Image / Logo Picture Upload & Preview -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {{ $t('vendors.image_label') }}
          </label>

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
                {{ $t('vendors.upload_image_hint') }}
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.image_url" class="space-y-2 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UIcon name="i-heroicons-photo" class="w-4 h-4 text-primary-500" />
                {{ $t('vendors.uploaded_image_preview') }}
              </span>
              <UButton color="rose" variant="ghost" icon="i-heroicons-trash" size="xs" @click="form.image_url = ''">
                {{ $t('vendors.remove_image') }}
              </UButton>
            </div>
            <div class="w-full h-64 sm:h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-900/50 overflow-hidden relative shadow-inner flex items-center justify-center p-2">
              <img :src="form.image_url" class="max-w-full max-h-full object-contain rounded-xl" />
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <UButton type="button" color="gray" variant="ghost" @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton color="primary" icon="i-heroicons-check" class="font-semibold shadow-md text-white" type="submit" :loading="isLoading || isUploadingImage">
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
import type { Vendor, VendorFormData } from '../types'
import { useImageUpload } from '../../../composables/useImageUpload'
import { useAppToast } from '../../../composables/useAppToast'

const { t } = useI18n()
const { uploadImage } = useImageUpload()
const { showError } = useAppToast()
const isUploadingImage = ref(false)

const props = defineProps<{
  vendorToEdit?: Vendor | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: VendorFormData): void
  (e: 'cancel'): void
}>()

const form = reactive({
  name_en: '',
  name_th: '',
  contact_name: '',
  phone: '',
  email: '',
  address_en: '',
  address_th: '',
  tax_id: '',
  type: 'company',
  image_url: ''
})

const errors = reactive({
  name_en: '',
  name_th: '',
  contact_name: '',
  phone: '',
  email: '',
  tax_id: '',
  type: ''
})

watch(() => props.vendorToEdit, (newVal) => {
  if (newVal) {
    form.name_en = newVal.name_en || ''
    form.name_th = newVal.name_th || ''
    form.contact_name = newVal.contact_name || ''
    form.phone = newVal.phone || ''
    form.email = newVal.email || ''
    form.address_en = newVal.address_en || ''
    form.address_th = newVal.address_th || ''
    form.tax_id = newVal.tax_id || ''
    form.type = newVal.type || 'company'
    form.image_url = newVal.image_url || ''
  }
}, { immediate: true })

const typeOptions = computed(() => [
  { label: t('vendors.type_company') || 'Company', value: 'company' },
  { label: t('vendors.type_individuals') || 'Individuals', value: 'individuals' }
])

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    form.image_url = reader.result as string
  }
  reader.readAsDataURL(file)
}

const submitForm = async () => {
  let isValid = true

  // Reset errors
  errors.name_en = ''
  errors.name_th = ''
  errors.contact_name = ''
  errors.phone = ''
  errors.email = ''
  errors.tax_id = ''
  errors.type = ''

  if (!form.type) {
    errors.type = t('vendors.err_type_required') || 'Vendor type is required'
    isValid = false
  }

  if (!form.name_en.trim()) {
    errors.name_en = t('vendors.err_name_en_required') || 'English name is required'
    isValid = false
  }

  if (!form.name_th.trim()) {
    errors.name_th = t('vendors.err_name_th_required') || 'Thai name is required'
    isValid = false
  }

  if (form.type === 'company' && !form.tax_id.trim()) {
    errors.tax_id = t('vendors.err_tax_id_required') || 'Tax ID is required for company vendors'
    isValid = false
  }

  if (form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      errors.email = t('vendors.err_invalid_email') || 'Invalid email address format'
      isValid = false
    }
  }

  if (!isValid) return

  let uploadedImageUrl = form.image_url

  if (form.image_url && form.image_url.startsWith('data:image/')) {
    isUploadingImage.value = true
    try {
      const url = await uploadImage(form.image_url, 'vendors')
      if (url) {
        uploadedImageUrl = url
      }
    } catch (err: any) {
      showError(`Failed to upload vendor logo image: ${err.message || err}`)
      isUploadingImage.value = false
      return
    } finally {
      isUploadingImage.value = false
    }
  }

  const payload: VendorFormData = {
    address_en: form.address_en,
    address_th: form.address_th,
    contact_name: form.contact_name,
    email: form.email,
    image_url: uploadedImageUrl,
    name_en: form.name_en,
    name_th: form.name_th,
    phone: form.phone,
    tax_id: form.tax_id,
    type: typeof form.type === 'object' ? (form.type as any).value : form.type
  }

  emit('save', payload)
}
</script>
