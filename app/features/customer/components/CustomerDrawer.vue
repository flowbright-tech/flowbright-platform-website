<template>
  <USlideover v-model:open="isOpen">
    <template #content>
      <div class="p-6 flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-indigo-500" />
              {{ isEditing ? $t('customers.edit_customer') : $t('customers.add_customer') }}
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
                {{ $t('customers.col_name') }} *
              </label>
              <UInput
                v-model="form.name"
                required
                placeholder="Company / Entity Name"
                icon="i-heroicons-building-office"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('customers.col_email') }} *
              </label>
              <UInput
                v-model="form.email"
                type="email"
                required
                placeholder="billing@company.com"
                icon="i-heroicons-envelope"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('customers.col_phone') }}
              </label>
              <UInput
                v-model="form.phone"
                placeholder="+66 2 123 4567"
                icon="i-heroicons-phone"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('customers.col_segment') }}
              </label>
              <USelect
                v-model="form.segment"
                :items="segmentOptions"
                size="md"
                class="w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ $t('customers.col_status') }}
              </label>
              <USelect
                v-model="form.status"
                :items="statusOptions"
                size="md"
                class="w-full"
              />
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
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
import type { Customer, CustomerFormData, CustomerSegment, CustomerStatus } from '../types'

const { t } = useI18n()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const props = defineProps<{
  customerToEdit?: Customer | null
}>()

const emit = defineEmits<{
  (e: 'save', data: CustomerFormData, id?: string): void
}>()

const isEditing = computed(() => !!props.customerToEdit)

const form = reactive<CustomerFormData>({
  name: '',
  email: '',
  phone: '',
  segment: 'sme',
  status: 'active'
})

watch(() => props.customerToEdit, (newVal) => {
  if (newVal) {
    form.name = newVal.name
    form.email = newVal.email
    form.phone = newVal.phone
    form.segment = newVal.segment
    form.status = newVal.status
  } else {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.segment = 'sme'
    form.status = 'active'
  }
}, { immediate: true })

const segmentOptions = computed(() => [
  { label: t('customers.segment_enterprise'), value: 'enterprise' },
  { label: t('customers.segment_sme'), value: 'sme' },
  { label: t('customers.segment_retail'), value: 'retail' }
])

const statusOptions = computed(() => [
  { label: t('customers.status_active'), value: 'active' },
  { label: t('customers.status_suspended'), value: 'suspended' },
  { label: t('customers.status_lead'), value: 'lead' }
])

const handleSubmit = () => {
  if (!form.name || !form.email) return
  emit('save', { ...form }, props.customerToEdit?.id)
  isOpen.value = false
}
</script>
