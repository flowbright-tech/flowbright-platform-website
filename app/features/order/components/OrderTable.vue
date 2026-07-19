<template>
  <div class="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
    <UTable :data="orders" :columns="columns" :loading="isLoading">
      <!-- Customer & Order Info column -->
      <template #customer_name-cell="{ row }">
        <div class="flex flex-col py-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 dark:text-white text-sm">
              {{ row.original.customer_name || 'N/A' }}
            </span>
            <UBadge v-if="row.original.code || row.original.order_number" color="neutral" variant="subtle" size="xs" class="font-mono">
              {{ row.original.code || row.original.order_number }}
            </UBadge>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span v-if="row.original.customer_email" class="flex items-center gap-1">
              <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-slate-400" />
              {{ row.original.customer_email }}
            </span>
            <span v-if="row.original.customer_phone" class="flex items-center gap-1">
              <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-slate-400" />
              {{ row.original.customer_phone }}
            </span>
          </div>
        </div>
      </template>

      <!-- Delivery Date cell (Formatted as DD-MMM-YYYY) -->
      <template #delivery_date-cell="{ row }">
        <div class="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-xs font-mono">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{{ formatDeliveryDate(row.original.delivery_date) }}</span>
        </div>
      </template>

      <!-- Payment Channel cell (3 types: Cash, Credit Card, Internet Banking) -->
      <template #payment_channel-cell="{ row }">
        <UBadge :color="getPaymentBadgeColor(row.original.payment_channel)" variant="soft" size="xs" class="capitalize">
          <UIcon :name="getPaymentIcon(row.original.payment_channel)" class="w-3.5 h-3.5 mr-1" />
          {{ formatPaymentChannel(row.original.payment_channel) }}
        </UBadge>
      </template>

      <!-- Status cell -->
      <template #status-cell="{ row }">
        <UBadge :color="getStatusBadgeColor(row.original.status)" variant="solid" size="xs" class="capitalize font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-white mr-1.5 inline-block animate-pulse"></span>
          {{ formatStatus(row.original.status) }}
        </UBadge>
      </template>

      <!-- Items Count cell -->
      <template #items-cell="{ row }">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          {{ row.original.items?.length || 0 }} {{ $t('orders.col_items') || 'Items' }}
        </span>
      </template>

      <!-- Total Amount cell -->
      <template #total_amount-cell="{ row }">
        <span class="font-mono font-bold text-slate-900 dark:text-white text-sm">
          ฿{{ formatCurrency(row.original.total_amount) }}
        </span>
      </template>

      <!-- Actions cell -->
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-eye"
            size="xs"
            :title="$t('orders.view_detail') || 'View Details'"
            @click="$emit('view', row.original)"
          />
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            size="xs"
            @click="$emit('edit', row.original)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="xs"
            @click="$emit('delete', row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Empty State -->
    <div v-if="!isLoading && orders.length === 0" class="p-12 text-center space-y-3">
      <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-slate-400 mx-auto" />
      <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {{ $t('common.no_data') || 'No orders found' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Order } from '../types'
import { formatDeliveryDate } from '../composables/useOrderEngine'

const props = defineProps<{
  orders: Order[]
  isLoading?: boolean
}>()

defineEmits<{
  (e: 'view', order: Order): void
  (e: 'edit', order: Order): void
  (e: 'delete', id: string): void
}>()

const { t } = useI18n()

const columns = computed(() => [
  { accessorKey: 'customer_name', header: t('orders.col_order_info') || 'Order / Customer' },
  { accessorKey: 'delivery_date', header: t('orders.col_delivery_date') || 'Delivery Date' },
  { accessorKey: 'payment_channel', header: t('orders.col_payment') || 'Payment' },
  { accessorKey: 'status', header: t('orders.col_status') || 'Status' },
  { accessorKey: 'items', header: t('orders.col_items') || 'Items' },
  { accessorKey: 'total_amount', header: t('orders.col_total') || 'Total Amount' },
  { accessorKey: 'actions', header: t('orders.col_actions') || 'Actions' }
])

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    default: return 'neutral'
  }
}

const formatStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return t('orders.status_pending') || 'Pending'
    case 'processing': return t('orders.status_processing') || 'Processing'
    case 'completed': return t('orders.status_completed') || 'Completed'
    case 'cancelled': return t('orders.status_cancelled') || 'Cancelled'
    default: return status || '-'
  }
}

const getPaymentBadgeColor = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return 'warning'
    case 'credit_card': return 'primary'
    case 'internet_banking': return 'info'
    default: return 'neutral'
  }
}

const getPaymentIcon = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return 'i-heroicons-banknotes'
    case 'credit_card': return 'i-heroicons-credit-card'
    case 'internet_banking': return 'i-heroicons-globe-alt'
    default: return 'i-heroicons-currency-dollar'
  }
}

const formatPaymentChannel = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return t('orders.payment_cash') || 'Cash'
    case 'credit_card': return t('orders.payment_credit_card') || 'Credit Card'
    case 'internet_banking': return t('orders.payment_internet_banking') || 'Internet Banking'
    default: return channel || '-'
  }
}
</script>
