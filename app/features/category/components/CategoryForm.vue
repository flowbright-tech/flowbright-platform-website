<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- Section 1: Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            {{ $t('categories.sec_basic') || 'Basic Information' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :error="errors.name_en || undefined">
              <template #label>
                <span>{{ $t('categories.name_en') || 'Category Name (English)' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_en"
                placeholder="e.g., Raw Materials"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField :error="errors.name_th || undefined">
              <template #label>
                <span>{{ $t('categories.name_th') || 'Category Name (Thai)' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.name_th"
                placeholder="เช่น วัตถุดิบ"
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 2: Hierarchy & Options -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            {{ $t('categories.sec_hierarchy') || 'Hierarchy & Sorting' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="$t('categories.parent_category') || 'Parent Category'">
              <USelectMenu
                v-model="form.parent_id"
                :items="parentCategoryOptions"
                value-key="value"
                label-key="label"
                searchable
                size="md"
                class="w-full"
                :placeholder="$t('categories.select_parent') || 'Select Parent Category'"
              />
            </UFormField>

            <UFormField :error="errors.sort_order || undefined" :label="$t('categories.sort_order') || 'Sort Order'">
              <UInput
                v-model.number="form.sort_order"
                type="number"
                min="0"
                size="md"
                class="w-full"
              />
            </UFormField>

            <div class="flex items-center gap-3 pt-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('categories.is_active') || 'Is Active Status' }}
              </label>
              <USwitch v-model="form.is_active" color="primary" />
            </div>
          </div>
        </div>

        <!-- Section 3: Category Picture -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            {{ $t('categories.sec_image') || 'Category Image' }}
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
                {{ $t('categories.upload_image_hint') || 'Drag and drop or click to upload Category icon...' }}
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.image_url" class="space-y-2 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UIcon name="i-heroicons-photo" class="w-4 h-4 text-primary-500" />
                {{ $t('categories.uploaded_preview') || 'Image Preview' }}
              </span>
              <UButton color="rose" variant="ghost" icon="i-heroicons-trash" size="xs" @click="form.image_url = ''">
                {{ $t('categories.remove_image') || 'Remove' }}
              </UButton>
            </div>
            <div class="w-40 h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/30">
              <img :src="form.image_url" class="w-full h-full object-cover" />
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
import { reactive, watch, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Category, CategoryFormData } from '../types'
import { useImageUpload } from '../../../composables/useImageUpload'
import { useAppToast } from '../../../composables/useAppToast'

const { t, locale } = useI18n()
const { uploadImage } = useImageUpload()
const { showError } = useAppToast()
const isUploadingImage = ref(false)

const props = defineProps<{
  categoryToEdit?: Category | null
  isLoading?: boolean
  allCategories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', data: CategoryFormData): void
  (e: 'cancel'): void
}>()

const form = reactive({
  name_en: '',
  name_th: '',
  parent_id: 'root',
  is_active: true,
  sort_order: 0,
  image_url: ''
})

const errors = reactive({
  name_en: '',
  name_th: '',
  sort_order: ''
})

const parentCategoryOptions = computed(() => {
  const list = props.allCategories || []
  const currentId = props.categoryToEdit?.id
  
  let filtered = list
  if (currentId) {
    filtered = list.filter(c => c.id !== currentId)
  }

  return [
    { label: t('categories.no_parent') || 'None (Root Category)', value: 'root' },
    ...filtered.map(c => ({
      label: locale.value === 'th' ? c.name_th : c.name_en,
      value: c.id
    }))
  ]
})

watch(() => props.categoryToEdit, (newVal) => {
  if (newVal) {
    form.name_en = newVal.name_en || ''
    form.name_th = newVal.name_th || ''
    form.parent_id = newVal.parent_id || 'root'
    form.is_active = newVal.is_active
    form.sort_order = newVal.sort_order || 0
    form.image_url = newVal.image_url || ''
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

  errors.name_en = ''
  errors.name_th = ''
  errors.sort_order = ''

  if (!form.name_en.trim()) {
    errors.name_en = t('categories.err_name_en_required') || 'English category name is required'
    isValid = false
  }

  if (!form.name_th.trim()) {
    errors.name_th = t('categories.err_name_th_required') || 'Thai category name is required'
    isValid = false
  }

  if (form.sort_order === undefined || form.sort_order === null || isNaN(form.sort_order) || form.sort_order < 0) {
    errors.sort_order = t('categories.err_sort_order') || 'Sort order must be a non-negative number'
    isValid = false
  }

  if (!isValid) return

  let uploadedImageUrl = form.image_url

  if (form.image_url && form.image_url.startsWith('data:image/')) {
    isUploadingImage.value = true
    try {
      const url = await uploadImage(form.image_url, 'categories')
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

  let calculatedLevel = 0
  const mappedParentId = form.parent_id === 'root' ? null : (form.parent_id || null)
  
  if (mappedParentId) {
    const parent = props.allCategories.find(c => c.id === mappedParentId)
    if (parent) {
      calculatedLevel = (parent.level || 0) + 1
    }
  }

  const payload: CategoryFormData = {
    name_en: form.name_en,
    name_th: form.name_th,
    parent_id: mappedParentId,
    level: calculatedLevel,
    is_active: form.is_active,
    sort_order: form.sort_order,
    image_url: uploadedImageUrl || null
  }

  emit('save', payload)
}
</script>
