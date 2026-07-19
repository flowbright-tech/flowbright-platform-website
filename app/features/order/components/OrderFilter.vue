<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
    <div class="flex flex-col sm:flex-row items-center gap-3 flex-1">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          :placeholder="$t('orders.search_placeholder') || 'Search orders...'"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Status Filter Dropdown (Searchable) -->
      <div class="w-full sm:w-48">
        <USelectMenu
          v-model="statusFilter"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Payment Channel Filter Dropdown (Searchable) -->
      <div class="w-full sm:w-52">
        <USelectMenu
          v-model="paymentChannelFilter"
          :items="paymentOptions"
          value-key="value"
          label-key="label"
          size="md"
          class="w-full"
        />
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex items-center gap-2 shrink-0">
      <UButton
        color="primary"
        icon="i-heroicons-plus-circle"
        size="md"
        class="font-semibold shadow-sm px-5"
        @click="$emit('create')"
      >
        {{ $t('orders.add_order') || 'Create Order' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const statusFilter = defineModel<string>('statusFilter', { default: '' })
const paymentChannelFilter = defineModel<string>('paymentChannelFilter', { default: '' })

defineEmits<{
  (e: 'create'): void
}>()

const statusOptions = computed(() => [
  { value: '', label: t('orders.all_statuses') || 'All Statuses' },
  { value: 'pending', label: t('orders.status_pending') || 'Pending' },
  { value: 'processing', label: t('orders.status_processing') || 'Processing' },
  { value: 'completed', label: t('orders.status_completed') || 'Completed' },
  { value: 'cancelled', label: t('orders.status_cancelled') || 'Cancelled' }
])

const paymentOptions = computed(() => [
  { value: '', label: t('orders.all_payment_channels') || 'All Payment Channels' },
  { value: 'cash', label: t('orders.payment_cash') || 'Cash' },
  { value: 'credit_card', label: t('orders.payment_credit_card') || 'Credit Card' },
  { value: 'internet_banking', label: t('orders.payment_internet_banking') || 'Internet Banking' }
])
</script>
