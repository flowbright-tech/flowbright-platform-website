<template>
  <USlideover
    v-model:open="isOpen"
    :title="vendorToEdit ? $t('vendors.edit_vendor') : $t('vendors.add_vendor')"
    class="max-w-2xl"
  >
    <template #body>
      <div class="p-6">
        <VendorForm
          :vendor-to-edit="vendorToEdit"
          :is-loading="isLoading"
          @save="handleSave"
          @cancel="isOpen = false"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { Vendor, VendorFormData } from '../types'
import VendorForm from './VendorForm.vue'

defineProps<{
  vendorToEdit?: Vendor | null
  isLoading?: boolean
}>()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const emit = defineEmits<{
  (e: 'save', data: VendorFormData): void
}>()

const handleSave = (data: VendorFormData) => {
  emit('save', data)
  isOpen.value = false
}
</script>
