<template>
  <USlideover v-model:open="isOpen">
    <template #content>
      <div class="p-6 flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-building-storefront" class="w-6 h-6 text-amber-500" />
              {{ isEditing ? $t('vendors.edit_vendor') : $t('vendors.add_vendor') }}
            </h2>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="sm"
              @click="isOpen = false"
            />
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('vendors.col_name') }} *
              </label>
              <UInput
                v-model="form.name"
                required
                placeholder="Supplier Legal Entity Name"
                icon="i-heroicons-building-office-2"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('vendors.col_tax_id') }} *
              </label>
              <UInput
                v-model="form.taxId"
                required
                placeholder="TH-TX-10029399"
                icon="i-heroicons-identification"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('vendors.col_reg_id') }}
              </label>
              <UInput
                v-model="form.regId"
                placeholder="REG-990-23-A"
                icon="i-heroicons-document-text"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('vendors.col_phone') }}
              </label>
              <UInput
                v-model="form.phone"
                placeholder="+66 2 999 8888"
                icon="i-heroicons-phone"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('vendors.col_category') }}
              </label>
              <USelect
                v-model="form.category"
                :items="categoryOptions"
                size="md"
                class="w-full"
              />
            </div>
          </form>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <UButton
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            color="indigo"
            icon="i-heroicons-check"
            class="font-semibold shadow-md"
            @click="handleSubmit"
          >
            {{ $t('common.save') }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vendor, VendorFormData, SupplyCategory } from '../types'

const { t } = useI18n()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const props = defineProps<{
  vendorToEdit?: Vendor | null
}>()

const emit = defineEmits<{
  (e: 'save', data: VendorFormData, id?: string): void
}>()

const isEditing = computed(() => !!props.vendorToEdit)

const form = reactive<VendorFormData>({
  name: '',
  taxId: '',
  regId: '',
  phone: '',
  category: 'raw_materials'
})

watch(() => props.vendorToEdit, (newVal) => {
  if (newVal) {
    form.name = newVal.name
    form.taxId = newVal.taxId
    form.regId = newVal.regId
    form.phone = newVal.phone
    form.category = newVal.category
  } else {
    form.name = ''
    form.taxId = ''
    form.regId = ''
    form.phone = ''
    form.category = 'raw_materials'
  }
}, { immediate: true })

const categoryOptions = computed(() => [
  { label: t('vendors.cat_raw_materials'), value: 'raw_materials' },
  { label: t('vendors.cat_it_hardware'), value: 'it_hardware' },
  { label: t('vendors.cat_logistics'), value: 'logistics' },
  { label: t('vendors.cat_office_supplies'), value: 'office_supplies' }
])

const handleSubmit = () => {
  if (!form.name || !form.taxId) return
  emit('save', { ...form }, props.vendorToEdit?.id)
  isOpen.value = false
}
</script>
