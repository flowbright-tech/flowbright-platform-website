<template>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 glass-panel rounded-2xl mb-6">
    <div class="flex-1 flex flex-col sm:flex-row items-center gap-3">
      <!-- Search Bar -->
      <div class="w-full sm:w-72">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          :placeholder="$t('customers.search_placeholder')"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Segment Filter -->
      <div class="w-full sm:w-44">
        <USelect
          v-model="selectedSegment"
          :options="segmentOptions"
          option-attribute="label"
          value-attribute="value"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Status Filter -->
      <div class="w-full sm:w-44">
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          option-attribute="label"
          value-attribute="value"
          size="md"
          class="w-full"
        />
      </div>
    </div>

    <!-- Create Customer Button -->
    <UButton
      color="primary"
      icon="i-heroicons-plus"
      size="md"
      class="font-semibold shadow-sm"
      @click="$emit('open-create')"
    >
      {{ $t('customers.add_customer') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const selectedSegment = defineModel<string>('selectedSegment', { default: 'all' })
const selectedStatus = defineModel<string>('selectedStatus', { default: 'all' })

defineEmits<{
  (e: 'open-create'): void
}>()

const segmentOptions = computed(() => [
  { label: t('customers.filter_segment'), value: 'all' },
  { label: t('customers.segment_enterprise'), value: 'enterprise' },
  { label: t('customers.segment_sme'), value: 'sme' },
  { label: t('customers.segment_retail'), value: 'retail' }
])

const statusOptions = computed(() => [
  { label: t('customers.filter_status'), value: 'all' },
  { label: t('customers.status_active'), value: 'active' },
  { label: t('customers.status_suspended'), value: 'suspended' },
  { label: t('customers.status_lead'), value: 'lead' }
])
</script>
