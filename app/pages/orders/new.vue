<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Breadcrumb Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/orders')" class="hover:text-indigo-600 transition-colors">
        {{ $t('orders.title') || 'Orders' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('orders.form_title_new') || 'Create New Order' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-clipboard-document-check" class="w-7 h-7 text-indigo-500" />
        {{ $t('orders.form_title_new') || 'Create New Order' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('orders.form_subtitle_new') || 'Fill in customer details, select delivery date, and add package items' }}
      </p>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Form Error"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Order Form -->
    <OrderForm
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useOrderEngine } from '../../features/order/composables/useOrderEngine'
import { useAppToast } from '../../composables/useAppToast'
import OrderForm from '../../features/order/components/OrderForm.vue'
import type { OrderFormData } from '../../features/order/types'

const router = useRouter()
const localePath = useLocalePath()
const { addOrder, isLoading, errorMsg } = useOrderEngine()
const { showSuccess } = useAppToast()

const handleSave = async (formData: OrderFormData) => {
  try {
    await addOrder(formData)
    showSuccess('create', 'Order')
    router.push(localePath('/orders'))
  } catch (err: any) {
    // Handled in composable
  }
}

const handleCancel = () => {
  router.push(localePath('/orders'))
}
</script>
