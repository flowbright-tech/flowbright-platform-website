<template>
  <UModal v-model:open="isOpen" :title="$t('orders.order_detail_title') || 'Order Specification Detail'" class="max-w-3xl">
    <template #content>
      <div v-if="order" class="p-6 space-y-6">
        <!-- Order Header Summary -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              Order Identifier
            </div>
            <div class="text-lg font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{{ order.code || order.order_number || order.id }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UBadge :color="getStatusBadgeColor(order.status)" variant="solid" size="md" class="capitalize font-bold px-3 py-1 text-xs sm:text-sm">
              {{ formatStatus(order.status) }}
            </UBadge>
            <UBadge :color="getPaymentBadgeColor(order.payment_channel)" variant="soft" size="md" class="capitalize font-bold px-3 py-1 text-xs sm:text-sm">
              {{ formatPaymentChannel(order.payment_channel) }}
            </UBadge>
          </div>
        </div>

        <!-- Customer & Delivery Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Customer Info -->
          <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-indigo-500" />
              {{ $t('orders.sec_customer') || 'Customer Information' }}
            </div>
            <div class="font-bold text-slate-900 dark:text-white text-base">
              {{ order.customer_name }}
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div v-if="order.customer_email" class="flex items-center gap-2">
                <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-slate-400" />
                {{ order.customer_email }}
              </div>
              <div v-if="order.customer_phone" class="flex items-center gap-2">
                <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-slate-400" />
                {{ order.customer_phone }}
              </div>
            </div>
          </div>

          <!-- Delivery Details (DD-MMM-YYYY format) -->
          <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UIcon name="i-heroicons-truck" class="w-4 h-4 text-emerald-500" />
              {{ $t('orders.sec_delivery') || 'Delivery & Payment' }}
            </div>
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm font-mono">
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-indigo-500" />
              <span>{{ formatDeliveryDate(order.delivery_date) }}</span>
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400">
              <span class="font-semibold">Channel:</span> {{ formatPaymentChannel(order.payment_channel) }}
            </div>
          </div>
        </div>

        <!-- Package Items Table -->
        <div class="space-y-3">
          <div class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UIcon name="i-heroicons-gift" class="w-4 h-4 text-indigo-500" />
            {{ $t('orders.sec_items') || 'Order Package Items' }}
          </div>

          <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 uppercase font-bold text-slate-500 dark:text-slate-400">
                  <th class="px-4 py-2.5 text-left">Package</th>
                  <th class="px-4 py-2.5 text-right">Unit Price</th>
                  <th class="px-4 py-2.5 text-center">Qty</th>
                  <th class="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="(item, idx) in order.items" :key="idx">
                  <td class="px-4 py-3">
                    <div class="font-bold text-slate-900 dark:text-white">
                      {{ locale === 'th' ? (item.package_name_th || (item as any).package?.name_th || (item as any).name_th || item.package_name_en || (item as any).package?.name_en || item.package_id) : (item.package_name_en || (item as any).package?.name_en || (item as any).name_en || item.package_name_th || (item as any).package?.name_th || item.package_id) }}
                    </div>
                    <div v-if="item.notes" class="text-[11px] text-slate-500 italic mt-0.5">
                      Note: {{ item.notes }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right font-mono font-medium">
                    ฿{{ formatCurrency(item.unit_price) }}
                  </td>
                  <td class="px-4 py-3 text-center font-mono font-bold">
                    {{ item.quantity }}
                  </td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ฿{{ formatCurrency(item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <div class="font-bold flex items-center gap-1">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
            {{ $t('orders.notes') || 'Order Notes' }}
          </div>
          <p>{{ order.notes }}</p>
        </div>

        <!-- Total Summary Bar -->
        <div class="flex items-center justify-between p-4 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/50">
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ $t('orders.total_amount') || 'Total Amount' }}
          </span>
          <span class="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
            ฿{{ formatCurrency(order.total_amount) }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Order } from '../types'
import { formatDeliveryDate } from '../composables/useOrderEngine'

const isOpen = defineModel<boolean>('open', { default: false })

defineProps<{
  order?: Order | null
}>()

const { t, locale } = useI18n()

const formatCurrency = (val?: number) => {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusBadgeColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    default: return 'neutral'
  }
}

const formatStatus = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return t('orders.status_pending') || 'Pending'
    case 'processing': return t('orders.status_processing') || 'Processing'
    case 'completed': return t('orders.status_completed') || 'Completed'
    case 'cancelled': return t('orders.status_cancelled') || 'Cancelled'
    default: return status || '-'
  }
}

const getPaymentBadgeColor = (channel?: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return 'warning'
    case 'credit_card': return 'primary'
    case 'internet_banking': return 'info'
    default: return 'neutral'
  }
}

const formatPaymentChannel = (channel?: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return t('orders.payment_cash') || 'Cash'
    case 'credit_card': return t('orders.payment_credit_card') || 'Credit Card'
    case 'internet_banking': return t('orders.payment_internet_banking') || 'Internet Banking'
    default: return channel || '-'
  }
}
</script>
