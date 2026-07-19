<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Breadcrumb Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/orders')" class="hover:text-indigo-600 transition-colors">
        {{ $t('orders.title') || 'Orders' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('orders.form_title_edit') || 'Edit Order' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-indigo-500" />
        {{ $t('orders.form_title_edit') || 'Edit Order' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('orders.form_subtitle_edit') || 'Update order status, delivery date, customer info, or package quantities' }}
      </p>
    </div>

    <!-- Error Alert if fetch or update fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Form Error"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Skeleton Loader while fetching target order -->
    <div v-if="isFetchingOrder" class="space-y-6 animate-pulse">
      <UCard class="glass-panel p-8">
        <div class="space-y-4">
          <USkeleton class="h-6 w-1/3 rounded" />
          <USkeleton class="h-10 w-full rounded-lg" />
          <USkeleton class="h-10 w-full rounded-lg" />
          <USkeleton class="h-24 w-full rounded-lg" />
        </div>
      </UCard>
    </div>

    <!-- Order Form -->
    <OrderForm
      v-else-if="targetOrder"
      :order-to-edit="targetOrder"
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useOrderEngine } from '../../../features/order/composables/useOrderEngine'
import type { Order, OrderFormData } from '../../../features/order/types'
import OrderForm from '../../../features/order/components/OrderForm.vue'
import { useAppToast } from '../../../composables/useAppToast'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { showSuccess, showError } = useAppToast()

const { fetchOrderById, updateOrder, isLoading, errorMsg } = useOrderEngine()

const isFetchingOrder = ref(true)
const targetOrder = ref<Order | null>(null)
const orderId = String(route.params.id)

onMounted(async () => {
  isFetchingOrder.value = true
  targetOrder.value = await fetchOrderById(orderId)
  isFetchingOrder.value = false
  if (!targetOrder.value && !errorMsg.value) {
    showError('Order not found')
    router.push(localePath('/orders'))
  }
})

const handleSave = async (formData: OrderFormData) => {
  try {
    await updateOrder(orderId, formData)
    showSuccess('update', 'Order')
    router.push(localePath('/orders'))
  } catch (err: any) {
    // Handled in composable / apiFetch
  }
}

const handleCancel = () => {
  router.push(localePath('/orders'))
}
</script>
