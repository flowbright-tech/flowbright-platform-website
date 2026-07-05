<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- Section 1: Customer Type & Code -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <UFormField>
            <template #label>
              <span>{{ $t('customers.customer_type') }}</span>
              <span class="text-red-500 font-bold ml-0.5">*</span>
            </template>
            <USelectMenu
              v-model="form.customer_type"
              :items="customerTypeOptions"
              value-key="value"
              label-key="label"
              searchable
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('customers.customer_code')">
            <UInput
              v-model="form.code"
              placeholder="HN2026000002"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Section 2: Verification Type Selector -->
        <div class="space-y-3">
          <label class="block text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            <span>{{ $t('customers.verification_type') }}</span>
            <span class="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="opt in verificationTypes"
              :key="opt.value"
              class="border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              :class="[
                form.verification_type === opt.value
                  ? 'border-primary-600 bg-primary-500/10 text-primary-600 dark:border-primary-400 dark:bg-primary-400/10 dark:text-primary-400 shadow-sm ring-1 ring-primary-500/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              ]"
              @click="form.verification_type = opt.value"
            >
              <UIcon :name="opt.icon" class="w-6 h-6 shrink-0" />
              <span class="text-xs font-bold capitalize">{{ opt.label }}</span>
            </div>
          </div>
        </div>

        <!-- Section 3: Identity Documents Upload & Large Preview -->
        <div class="space-y-3">
          <label class="block text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {{ $t('customers.doc_picture') }}
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
                {{ $t('customers.upload_doc_hint') }}
              </div>
            </div>
          </div>

          <!-- Large Document Image Preview -->
          <div v-if="form.image_url" class="space-y-2 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UIcon name="i-heroicons-photo" class="w-4 h-4 text-primary-500" />
                {{ $t('customers.uploaded_doc_preview') }}
              </span>
              <UButton color="rose" variant="ghost" icon="i-heroicons-trash" size="xs" @click="form.image_url = ''">
                {{ $t('customers.remove_image') }}
              </UButton>
            </div>
            <div class="w-full h-80 sm:h-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-900/50 overflow-hidden relative shadow-inner flex items-center justify-center p-2">
              <img :src="form.image_url" class="max-w-full max-h-full object-contain rounded-xl" />
            </div>
          </div>
        </div>

        <!-- Section 4: Conditional Details (Thai vs English Name & ID) -->
        <div v-if="form.verification_type === 'idcard'" class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Thai Citizen Details</h3>
          
          <div class="space-y-4">
            <UFormField :error="errors.id_card">
              <template #label>
                <span>{{ $t('customers.id_card_num') }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.id_card"
                placeholder="1100700123456"
                size="md"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField :label="$t('customers.prefix_th')">
                <USelectMenu
                  v-model="form.prefix_th"
                  :items="prefixThOptions"
                  value-key="value"
                  label-key="label"
                  searchable
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <UFormField :error="errors.first_name_th">
                <template #label>
                  <span>{{ $t('customers.first_name_th') }}</span>
                  <span class="text-red-500 font-bold ml-0.5">*</span>
                </template>
                <UInput
                  v-model="form.first_name_th"
                  placeholder="สมชาย"
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <UFormField :error="errors.last_name_th">
                <template #label>
                  <span>{{ $t('customers.last_name_th') }}</span>
                  <span class="text-red-500 font-bold ml-0.5">*</span>
                </template>
                <UInput
                  v-model="form.last_name_th"
                  placeholder="ประเสริฐ"
                  size="md"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Optional English name fields when using Thai ID card -->
          <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">English Name (Optional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField :label="$t('customers.prefix_en')">
                <USelectMenu
                  v-model="form.prefix_en"
                  :items="prefixEnOptions"
                  value-key="value"
                  label-key="label"
                  searchable
                  size="md"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('customers.first_name_en')">
                <UInput v-model="form.first_name_en" placeholder="Somchai" size="md" class="w-full" />
              </UFormField>
              <UFormField :label="$t('customers.last_name_en')">
                <UInput v-model="form.last_name_en" placeholder="Prasert" size="md" class="w-full" />
              </UFormField>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Passport / International ID Details</h3>

          <div class="space-y-4">
            <UFormField :error="errors.passport">
              <template #label>
                <span>{{ $t('customers.passport_num') }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.passport"
                placeholder="AA1234567"
                size="md"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField :label="$t('customers.prefix_en')">
                <USelectMenu
                  v-model="form.prefix_en"
                  :items="prefixEnOptions"
                  value-key="value"
                  label-key="label"
                  searchable
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <UFormField :error="errors.first_name_en">
                <template #label>
                  <span>{{ $t('customers.first_name_en') }}</span>
                  <span class="text-red-500 font-bold ml-0.5">*</span>
                </template>
                <UInput
                  v-model="form.first_name_en"
                  placeholder="Somchai"
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <UFormField :error="errors.last_name_en">
                <template #label>
                  <span>{{ $t('customers.last_name_en') }}</span>
                  <span class="text-red-500 font-bold ml-0.5">*</span>
                </template>
                <UInput
                  v-model="form.last_name_en"
                  placeholder="Prasert"
                  size="md"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Optional Thai name fields when using Passport -->
          <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ชื่อภาษาไทย (Optional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField :label="$t('customers.prefix_th')">
                <USelectMenu
                  v-model="form.prefix_th"
                  :items="prefixThOptions"
                  value-key="value"
                  label-key="label"
                  searchable
                  size="md"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('customers.first_name_th')">
                <UInput v-model="form.first_name_th" placeholder="สมชาย" size="md" class="w-full" />
              </UFormField>
              <UFormField :label="$t('customers.last_name_th')">
                <UInput v-model="form.last_name_th" placeholder="ประเสริฐ" size="md" class="w-full" />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Section 5: General Contact & Demographics -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('customers.profile_contact_heading') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="$t('customers.tax_id')" :error="errors.tax_id" class="md:col-span-2">
              <template #label v-if="form.customer_type === 'company'">
                <span>{{ $t('customers.tax_id') }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.tax_id"
                placeholder="0105560012345"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('customers.email')" :error="errors.email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="somchai.dev@flowbright.io"
                size="md"
                icon="i-heroicons-envelope"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('customers.phone')" :error="errors.phone">
              <UInput
                v-model="form.phone"
                placeholder="+66812345678"
                size="md"
                icon="i-heroicons-phone"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('customers.gender')">
              <USelectMenu
                v-model="form.gender"
                :items="genderOptions"
                value-key="value"
                label-key="label"
                searchable
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('customers.nationality')">
              <USelectMenu
                v-model="form.nationality"
                :items="nationalityOptions"
                searchable
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="$t('customers.birth_date')">
              <UInput v-model="form.birth_date" type="date" size="md" icon="i-heroicons-calendar" class="w-full" />
            </UFormField>

            <UFormField :label="$t('customers.occupation')">
              <UInput v-model="form.occupation" placeholder="Senior Software Engineer" size="md" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Section 6: Address Detail (Full Width Address Textareas) -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('customers.address_heading') }}</h3>

          <div class="space-y-4">
            <UFormField :label="$t('customers.address_en')" class="w-full">
              <UTextarea v-model="form.address_en" placeholder="456 Moo 5, Pattaya Naklua Road..." size="md" rows="2" class="w-full" />
            </UFormField>
            <UFormField :label="$t('customers.address_th')" class="w-full">
              <UTextarea v-model="form.address_th" placeholder="456 หมู่ 5 ถนนพัทยานาเกลือ..." size="md" rows="2" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Section 7: Social Media Links -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ $t('customers.social_heading') }}</h3>
          <UFormField :label="$t('customers.social_media')">
            <UInput
              v-model="form.social_media"
              placeholder="Line: somchai_line | LinkedIn: somchai-dev"
              size="md"
              icon="i-heroicons-hashtag"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Action buttons with primary submit color -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <UButton color="gray" variant="ghost" @click="$emit('cancel')">
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
import type { Customer, CustomerFormData } from '../types'
import { useImageUpload } from '../../../composables/useImageUpload'

const { t } = useI18n()
const isUploadingImage = ref(false)

const props = defineProps<{
  customerToEdit?: Customer | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: CustomerFormData): void
  (e: 'cancel'): void
}>()

const form = reactive({
  code: '',
  customer_type: 'individuals',
  prefix_en: 'Mr.',
  prefix_th: 'นาย',
  first_name_en: '',
  last_name_en: '',
  first_name_th: '',
  last_name_th: '',
  email: '',
  phone: '',
  address_en: '',
  address_th: '',
  gender: 'Male',
  tax_id: '',
  nationality: 'Thailand',
  birth_date: '',
  id_card: '',
  passport: '',
  occupation: '',
  social_media: '',
  image_url: '',
  verification_type: 'idcard'
})

const errors = reactive({
  email: '',
  phone: '',
  tax_id: '',
  id_card: '',
  passport: '',
  first_name_th: '',
  last_name_th: '',
  first_name_en: '',
  last_name_en: ''
})

watch(() => props.customerToEdit, (newVal) => {
  if (newVal) {
    form.code = newVal.code || ''
    form.customer_type = newVal.type === 'company' ? 'company' : 'individuals'
    form.prefix_en = newVal.prefix_en || 'Mr.'
    form.prefix_th = newVal.prefix_th || 'นาย'
    form.first_name_en = newVal.first_name_en || ''
    form.last_name_en = newVal.last_name_en || ''
    form.first_name_th = newVal.first_name_th || ''
    form.last_name_th = newVal.last_name_th || ''
    form.email = newVal.email || ''
    form.phone = newVal.phone || ''
    form.address_en = newVal.address_en || ''
    form.address_th = newVal.address_th || ''
    form.gender = newVal.gender || 'Male'
    form.tax_id = newVal.tax_id || ''
    form.nationality = newVal.nationality || 'Thailand'
    form.birth_date = newVal.birth_date ? newVal.birth_date.split('T')[0] : ''
    form.id_card = newVal.id_card || ''
    form.passport = newVal.passport || ''
    form.occupation = newVal.occupation || ''
    form.image_url = newVal.image_url || ''
    form.social_media = newVal.social_media || ''
    
    if (newVal.id_card) {
      form.verification_type = 'idcard'
    } else if (newVal.passport) {
      form.verification_type = 'passport'
    } else {
      form.verification_type = 'others'
    }
  }
}, { immediate: true })

const customerTypeOptions = computed(() => [
  { label: t('customers.type_individuals'), value: 'individuals' },
  { label: t('customers.type_company'), value: 'company' }
])

const verificationTypes = computed(() => [
  { label: t('customers.id_card_type'), value: 'idcard', icon: 'i-heroicons-identification' },
  { label: t('customers.passport_type'), value: 'passport', icon: 'i-heroicons-globe-americas' },
  { label: t('customers.others_type'), value: 'others', icon: 'i-heroicons-shield-check' }
])

const prefixEnOptions = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Ms.', value: 'Ms.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Dr.', value: 'Dr.' }
]

const prefixThOptions = [
  { label: 'นาย', value: 'นาย' },
  { label: 'นางสาว', value: 'นางสาว' },
  { label: 'นาง', value: 'นาง' },
  { label: 'ดร.', value: 'ดร.' }
]

const genderOptions = computed(() => [
  { label: t('customers.gender_male'), value: 'Male' },
  { label: t('customers.gender_female'), value: 'Female' },
  { label: t('customers.gender_other'), value: 'Other' }
])

const nationalityOptions = [
  'Thailand', 'Singapore', 'Malaysia', 'Japan', 'South Korea', 'China', 'India',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Norway', 'Sweden', 'Finland',
  'New Zealand', 'Denmark', 'Russia', 'Brazil', 'South Africa'
]

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
  errors.email = ''
  errors.phone = ''
  errors.tax_id = ''
  errors.id_card = ''
  errors.passport = ''
  errors.first_name_th = ''
  errors.last_name_th = ''
  errors.first_name_en = ''
  errors.last_name_en = ''

  // 1. Customer Type validation: if company, Tax ID is required
  if (form.customer_type === 'company') {
    if (!form.tax_id.trim()) {
      errors.tax_id = t('customers.err_tax_id_required')
      isValid = false
    }
  }

  // 2. Email format validation (optional, validate only if filled)
  if (form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      errors.email = t('customers.err_invalid_email')
      isValid = false
    }
  }

  // 3. Phone format validation (optional, validate Thai mobile format if filled)
  if (form.phone.trim()) {
    const thaiPhoneRegex = /^(?:\+66|0)[689]\d{8}$/
    if (!thaiPhoneRegex.test(form.phone.trim().replace(/[-\s]/g, ''))) {
      errors.phone = t('customers.err_invalid_phone')
      isValid = false
    }
  }

  // 4. Identity validation based on verification type
  if (form.verification_type === 'idcard') {
    if (!form.id_card.trim()) {
      errors.id_card = t('customers.err_id_card_required')
      isValid = false
    } else if (!/^\d{13}$/.test(form.id_card.trim())) {
      errors.id_card = t('customers.err_id_card_format')
      isValid = false
    }

    if (!form.first_name_th.trim()) {
      errors.first_name_th = t('customers.err_first_name_th_required')
      isValid = false
    }
    if (!form.last_name_th.trim()) {
      errors.last_name_th = t('customers.err_last_name_th_required')
      isValid = false
    }
  } else {
    if (!form.passport.trim()) {
      errors.passport = t('customers.err_passport_required')
      isValid = false
    }

    if (!form.first_name_en.trim()) {
      errors.first_name_en = t('customers.err_first_name_en_required')
      isValid = false
    }
    if (!form.last_name_en.trim()) {
      errors.last_name_en = t('customers.err_last_name_en_required')
      isValid = false
    }
  }

  if (!isValid) return

  let uploadedImageUrl = form.image_url

  // If there's a new base64 picture, upload it to backend folder: 'customers'
  if (form.image_url && form.image_url.startsWith('data:image/')) {
    isUploadingImage.value = true
    try {
      const { uploadImage } = useImageUpload()
      const url = await uploadImage(form.image_url, 'customers')
      if (url) {
        uploadedImageUrl = url
      }
    } catch (err: any) {
      errors.email = `Failed to upload document image: ${err.message || err}`
      isUploadingImage.value = false
      return
    } finally {
      isUploadingImage.value = false
    }
  }

  // Construct payload conforming to backend schema requirements
  const payload: CustomerFormData = {
    code: form.code,
    type: form.customer_type,
    prefix_en: typeof form.prefix_en === 'object' ? (form.prefix_en as any).value : form.prefix_en,
    prefix_th: typeof form.prefix_th === 'object' ? (form.prefix_th as any).value : form.prefix_th,
    first_name_en: form.first_name_en,
    last_name_en: form.last_name_en,
    first_name_th: form.first_name_th,
    last_name_th: form.last_name_th,
    phone: form.phone,
    email: form.email,
    address_en: form.address_en,
    address_th: form.address_th,
    gender: typeof form.gender === 'object' ? (form.gender as any).value : form.gender,
    tax_id: form.tax_id,
    is_active: true,
    nationality: typeof form.nationality === 'object' ? (form.nationality as any).value : form.nationality,
    birth_date: form.birth_date ? `${form.birth_date}T00:00:00+00:00` : '',
    id_card: form.verification_type === 'idcard' ? form.id_card : '',
    passport: form.verification_type !== 'idcard' ? form.passport : '',
    occupation: form.occupation,
    social_media: form.social_media,
    image_url: uploadedImageUrl
  }

  emit('save', payload)
}
</script>
