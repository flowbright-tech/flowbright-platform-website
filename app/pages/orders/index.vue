<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-clipboard-document-check" class="w-7 h-7 text-indigo-500" />
          {{ $t('orders.title') || 'Order Management' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('orders.subtitle') || 'Manage customer purchase orders, delivery schedules, and payment tracking' }}
        </p>
      </div>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Load Orders"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Search & Filter Controls -->
    <OrderFilter
      v-model:search-query="searchQuery"
      @open-create="handleOpenCreate"
    />

    <!-- Skeleton Loader for async data fetching -->
    <div v-if="isLoading" class="space-y-4">
      <UCard class="glass-panel overflow-hidden animate-pulse" :ui="{ body: { padding: 'p-6 sm:p-6' } }">
        <div class="space-y-4">
          <div v-for="n in 5" :key="n" class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div class="space-y-2 w-1/3">
              <USkeleton class="h-4 w-3/4 rounded" />
              <USkeleton class="h-3 w-1/2 rounded" />
            </div>
            <USkeleton class="h-4 w-24 rounded" />
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="h-4 w-20 rounded" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Order Table -->
    <OrderTable
      v-else
      :orders="paginatedOrders"
      :is-loading="isLoading"
      @view="handleViewOrder"
      @edit="handleEditOrder"
      @delete="handleConfirmDelete"
      @print="handlePrintInvoice"
    />

    <!-- Pagination -->
    <div v-if="totalFilteredCount > pageSize" class="flex items-center justify-between pt-4">
      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalFilteredCount) }} of {{ totalFilteredCount }} orders
      </div>
      <UPagination
        v-model:page="currentPage"
        :total="totalFilteredCount"
        :items-per-page="pageSize"
        size="sm"
      />
    </div>

    <!-- Reusable Confirm Modal for Deletion -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('orders.confirm_delete_title') || 'Confirm Order Deletion'"
      :description="$t('orders.confirm_delete_desc') || 'Are you sure you want to permanently delete this order? This action cannot be undone.'"
      confirm-color="error"
      confirm-icon="i-heroicons-trash"
      :confirm-text="$t('common.delete') || 'Delete Order'"
      @confirm="executeDelete"
    />

    <!-- Quick Detail Modal -->
    <OrderDetailModal
      v-model:open="isDetailModalOpen"
      :order="selectedOrderForView"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOrderEngine } from '../../features/order/composables/useOrderEngine'
import type { Order } from '../../features/order/types'
import OrderFilter from '../../features/order/components/OrderFilter.vue'
import OrderTable from '../../features/order/components/OrderTable.vue'
import OrderDetailModal from '../../features/order/components/OrderDetailModal.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { showSuccess, showError } = useAppToast()

const {
  orders,
  totalFilteredCount,
  isLoading,
  errorMsg,
  searchQuery,
  statusFilter,
  paymentChannelFilter,
  currentPage,
  pageSize,
  fetchOrders,
  deleteOrder
} = useOrderEngine()

const isDeleteModalOpen = ref(false)
const orderIdToDelete = ref<string | null>(null)

const isDetailModalOpen = ref(false)
const selectedOrderForView = ref<Order | null>(null)

const paginatedOrders = computed(() => orders.value)

// Actions
const handleOpenCreate = () => {
  router.push(localePath('/orders/new'))
}

const handleEditOrder = (order: Order) => {
  router.push(localePath(`/orders/${order.id}`))
}

const handleViewOrder = (order: Order) => {
  selectedOrderForView.value = order
  isDetailModalOpen.value = true
}

const handlePrintInvoice = (order: Order) => {
  if (import.meta.client) {
    const routeUrl = localePath(`/orders/${order.id}/invoice`)
    window.open(routeUrl, '_blank')
  }
}

const handleConfirmDelete = (id: string) => {
  orderIdToDelete.value = id
  isDeleteModalOpen.value = true
}

const executeDelete = async () => {
  if (!orderIdToDelete.value) return
  const success = await deleteOrder(orderIdToDelete.value)
  if (success) {
    showSuccess(t('common.delete_success') || 'Order deleted successfully')
  } else {
    showError(errorMsg.value || t('common.delete_failed') || 'Failed to delete order')
  }
  orderIdToDelete.value = null
  isDeleteModalOpen.value = false
}

// Client-side hydration only (SSG Enforcer compliant)
onMounted(() => {
  fetchOrders()
})
</script>
